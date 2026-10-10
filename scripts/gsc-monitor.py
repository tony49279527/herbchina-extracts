"""
HerbChina Extracts - Google Search Console (GSC) Data Monitor & Reporter
Fetches Search Analytics, Sitemaps, and URL inspection data directly via GSC API.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import subprocess
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding='utf-8')

SITE_URL = "https://herbchina-extracts.vercel.app/"
QUOTA_PROJECT = os.environ.get("GOOGLE_CLOUD_QUOTA_PROJECT", "helloredlight-b2b-seo")
_CACHED_TOKEN = None

def get_access_token():
    global _CACHED_TOKEN
    if _CACHED_TOKEN:
        return _CACHED_TOKEN
    token = os.environ.get("GSC_ACCESS_TOKEN")
    if token:
        _CACHED_TOKEN = token
        return token
    try:
        token = subprocess.check_output(
            ["gcloud.cmd", "auth", "application-default", "print-access-token"],
            shell=True,
            text=True
        ).strip()
        _CACHED_TOKEN = token
        return token
    except Exception as e:
        raise RuntimeError(f"Failed to obtain GSC access token: {e}")

def gsc_request(endpoint, method="GET", body=None):
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "x-goog-user-project": QUOTA_PROJECT
    }
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(endpoint, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def fetch_sitemaps():
    site_param = urllib.parse.quote(SITE_URL, safe="")
    url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{site_param}/sitemaps"
    return gsc_request(url, method="GET")

def fetch_search_analytics(start_date, end_date, dimensions):
    site_param = urllib.parse.quote(SITE_URL, safe="")
    url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{site_param}/searchAnalytics/query"
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": 25000
    }
    return gsc_request(url, method="POST", body=body)

def inspect_url(target_url):
    url = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
    body = {
        "inspectionUrl": target_url,
        "siteUrl": SITE_URL
    }
    return gsc_request(url, method="POST", body=body)

def main():
    print("=" * 60, flush=True)
    print(f"HerbChina Extracts - GSC 数据监控报告", flush=True)
    print(f"站点: {SITE_URL}", flush=True)
    print("=" * 60, flush=True)

    # 1. 检查 Sitemap 状态
    print("\n[1] 读取 Sitemap 提交与抓取状态...", flush=True)
    try:
        sitemaps_data = fetch_sitemaps()
        sitemaps = sitemaps_data.get("sitemap", [])
        for sm in sitemaps:
            print(f"- 路径: {sm.get('path')}", flush=True)
            print(f"  最后提交: {sm.get('lastSubmitted')} | 最后下载: {sm.get('lastDownloaded')}", flush=True)
            contents = sm.get('contents', [{}])[0]
            print(f"  提交 URL 数量: {contents.get('submitted', '0')} | 已编入索引: {contents.get('indexed', '0')}", flush=True)
    except Exception as e:
        print(f"  获取 Sitemap 失败: {e}", flush=True)

    # 2. 查询最近 28 天搜索表现 (GSC 数据通常延迟 2-3 天)
    end_dt = datetime.now() - timedelta(days=3)
    start_dt = end_dt - timedelta(days=27)
    start_date = start_dt.strftime("%Y-%m-%d")
    end_date = end_dt.strftime("%Y-%m-%d")

    print(f"\n[2] 查询最近 28 天搜索表现 ({start_date} ~ {end_date})...", flush=True)
    
    # 汇总
    try:
        total_data = fetch_search_analytics(start_date, end_date, ["date"])
        rows = total_data.get("rows", [])
        total_clicks = sum(r.get("clicks", 0) for r in rows)
        total_imp = sum(r.get("impressions", 0) for r in rows)
        avg_ctr = (total_clicks / total_imp * 100) if total_imp > 0 else 0.0
        avg_pos = (sum(r.get("position", 0) * r.get("impressions", 0) for r in rows) / total_imp) if total_imp > 0 else 0.0
        print(f"  - 总点击量 (Clicks): {total_clicks}", flush=True)
        print(f"  - 总曝光量 (Impressions): {total_imp}", flush=True)
        print(f"  - 平均点击率 (CTR): {avg_ctr:.2f}%", flush=True)
        print(f"  - 平均排名 (Position): {avg_pos:.1f}", flush=True)
    except Exception as e:
        print(f"  获取总计失败: {e}", flush=True)

    # Top Queries
    try:
        queries_data = fetch_search_analytics(start_date, end_date, ["query"])
        q_rows = queries_data.get("rows", [])
        print(f"\n[3] 产生曝光的关键词清单 (共 {len(q_rows)} 个):", flush=True)
        if q_rows:
            for r in q_rows[:15]:
                print(f"  - [{r.get('impressions', 0)} imp | {r.get('clicks', 0)} click | pos {r.get('position', 0):.1f}] : {r.get('keys', [''])[0]}", flush=True)
        else:
            print("  - 暂无产生曝光的搜索词。", flush=True)
    except Exception as e:
        print(f"  获取关键词失败: {e}", flush=True)

    # Top Pages
    try:
        pages_data = fetch_search_analytics(start_date, end_date, ["page"])
        p_rows = pages_data.get("rows", [])
        print(f"\n[4] 产生曝光的页面清单 (共 {len(p_rows)} 个):", flush=True)
        if p_rows:
            for r in p_rows[:15]:
                page_slug = r.get('keys', [''])[0].replace(SITE_URL, '/')
                print(f"  - [{r.get('impressions', 0)} imp | {r.get('clicks', 0)} click | pos {r.get('position', 0):.1f}] : {page_slug}", flush=True)
        else:
            print("  - 暂无产生曝光的页面。", flush=True)
    except Exception as e:
        print(f"  获取页面失败: {e}", flush=True)

    # 3. 抽样 URL Inspection
    sample_urls = [
        SITE_URL,
        f"{SITE_URL}products.html",
        f"{SITE_URL}about.html",
        f"{SITE_URL}turmeric-extract.html"
    ]
    print(f"\n[5] 关键核心页面 Google 收录与索引诊断 (抽样 4 页)...", flush=True)
    for u in sample_urls:
        slug = u.replace(SITE_URL, '/')
        try:
            res = inspect_url(u)
            status = res.get("inspectionResult", {}).get("indexStatusResult", {})
            verdict = status.get("verdict", "UNKNOWN")
            coverage = status.get("coverageState", "Unknown state")
            last_crawl = status.get("lastCrawlTime", "Never")
            print(f"  - {slug:25} | 状态: {verdict:7} | 收录状态: {coverage} | 抓取时间: {last_crawl}", flush=True)
        except Exception as e:
            print(f"  - {slug:25} | 诊断出错: {e}", flush=True)

    print("\n" + "=" * 60, flush=True)
    print("监控运行完毕。", flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    main()
