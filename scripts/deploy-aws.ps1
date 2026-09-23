# AWS S3 + CloudFront Deployment Script for NKJxMNT KAUR 🎲
param (
    [string]$BucketName = $env:AWS_S3_BUCKET,
    [string]$DistributionId = $env:AWS_CLOUDFRONT_DIST_ID
)

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host " 🎲 Deploying NKJxMNT KAUR to AWS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Magenta

# Check bucket name
if (-not $BucketName) {
    $BucketName = Read-Host "Enter your S3 Bucket Name (e.g. nkjxmnt-kaur-web)"
}

if (-not $BucketName) {
    Write-Error "Error: S3 Bucket Name is required."
    exit 1
}

# 1. Build Production Bundle
Write-Host "`n📦 Step 1: Building production bundle (npm run build)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed! Please fix TypeScript/build errors before deploying."
    exit 1
}

# 2. Sync to S3
Write-Host "`n☁️  Step 2: Syncing dist/ to s3://$BucketName..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://$BucketName" --delete

if ($LASTEXITCODE -ne 0) {
    Write-Error "S3 sync failed. Ensure your AWS credentials are active (run 'aws login' or 'aws configure')."
    exit 1
}

Write-Host "✅ S3 sync complete!" -ForegroundColor Green

# 3. Invalidate CloudFront Cache (if provided)
if ($DistributionId) {
    Write-Host "`n🔄 Step 3: Invalidating CloudFront cache (Distribution: $DistributionId)..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CloudFront invalidation triggered!" -ForegroundColor Green
    }
} else {
    Write-Host "`nℹ️  Tip: Set AWS_CLOUDFRONT_DIST_ID to automatically purge CDN cache on deploy." -ForegroundColor Gray
}

Write-Host "`n🎉 Deployment finished successfully!" -ForegroundColor Green
Write-Host "Your NKJxMNT KAUR game is live on AWS!" -ForegroundColor Magenta
