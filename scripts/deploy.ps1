# HerbChina Extracts - Standard Build-Deploy-Verify Pipeline Script
# Usage: powershell -File scripts/deploy.ps1 [-SkipDeploy] [-DeployHookUrl "<url>"]

param(
    [switch]$SkipDeploy,
    [string]$DeployHookUrl = $env:VERCEL_DEPLOY_HOOK_HERBCHINA
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HerbChina Extracts Deployment Pipeline" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Baseline Preflight Check
Write-Host "`n[Step 1/3] Preflight Git Baseline..." -ForegroundColor Yellow
$remoteRef = git ls-remote origin main
$localHead = (git rev-parse HEAD).Trim()

if (-not $remoteRef) {
    Write-Error "Failed to fetch origin/main remote ref. Check network or git config."
}

$remoteSha = (($remoteRef -split "`t")[0]).Trim()
if ($remoteSha -ne $localHead) {
    Write-Warning "Remote origin/main ($remoteSha) does not match local HEAD ($localHead)!"
    Write-Warning "Please rebase or push changes before deploying."
} else {
    Write-Host "[OK] Local HEAD aligns with origin/main: $localHead" -ForegroundColor Green
}

# Step 2: Trigger Vercel Deployment
Write-Host "`n[Step 2/3] Triggering Vercel Deployment..." -ForegroundColor Yellow
if ($SkipDeploy) {
    Write-Host "[SKIP] Deployment trigger skipped by user. Proceeding to verification." -ForegroundColor Gray
} else {
    if (-not $DeployHookUrl) {
        Write-Warning "VERCEL_DEPLOY_HOOK_HERBCHINA is not set and no DeployHookUrl provided."
        Write-Host "Note: You can create a Deploy Hook in Vercel Dashboard -> Settings -> Git -> Deploy Hooks." -ForegroundColor Gray
        Write-Host "Skipping hook trigger and continuing to verify live status..." -ForegroundColor Yellow
    } else {
        Write-Host "Calling Vercel Deploy Hook..." -ForegroundColor Cyan
        try {
            $deployResp = Invoke-RestMethod -Uri $DeployHookUrl -Method Post
            Write-Host "[OK] Vercel Deploy Hook triggered successfully. Job ID: $($deployResp.job.id)" -ForegroundColor Green
            Write-Host "Waiting 15s for edge deployment to propagate..." -ForegroundColor Cyan
            Start-Sleep -Seconds 15
        } catch {
            Write-Error "Failed to invoke Vercel Deploy Hook: $_"
        }
    }
}

# Step 3: curl Verify Live Content
Write-Host "`n[Step 3/3] Live Verification via curl..." -ForegroundColor Yellow
& "$PSScriptRoot\verify-deploy.ps1"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  Pipeline Finished" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
