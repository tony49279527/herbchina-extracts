# HerbChina Extracts - 线上部署抽检验证脚本
# 用法: powershell -File scripts/verify-deploy.ps1

$domain = "https://herbchina-extracts.vercel.app"
$pages = @(
    "/turmeric-extract-manufacturers.html",
    "/suppliers.html",
    "/turmeric-extract.html",
    "/products.html",
    "/meshima-extract.html",
    "/sitemap.xml",
    "/googlef9a6056d748bb958.html"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HerbChina Extracts 线上部署验证" -ForegroundColor Cyan
Write-Host "  目标域名: $domain" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$allPassed = $true

foreach ($path in $pages) {
    $url = "$domain$path"
    $response = curl.exe -I -s $url
    $firstLine = ($response | Select-Object -First 1).Trim()
    
    if ($firstLine -match "200") {
        Write-Host "[PASS] 200 OK  : $path" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $firstLine : $path" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host "------------------------------------------"
if ($allPassed) {
    Write-Host "所有抽检页面均正常返回 HTTP 200，线上服务正常！" -ForegroundColor Green
} else {
    Write-Host "存在异常页面，请检查部署状态！" -ForegroundColor Red
}
