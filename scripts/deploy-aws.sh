#!/usr/bin/env bash
# AWS S3 + CloudFront Deployment Script for NKJxMNT KAUR 🎲
set -e

BUCKET_NAME="${1:-$AWS_S3_BUCKET}"
DIST_ID="${2:-$AWS_CLOUDFRONT_DIST_ID}"

echo "=========================================="
echo " 🎲 Deploying NKJxMNT KAUR to AWS"
echo "=========================================="

if [ -z "$BUCKET_NAME" ]; then
  read -p "Enter your S3 Bucket Name: " BUCKET_NAME
fi

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: S3 Bucket Name is required."
  exit 1
fi

echo -e "\n📦 Step 1: Building production bundle (npm run build)..."
npm run build

echo -e "\n☁️  Step 2: Syncing dist/ to s3://$BUCKET_NAME..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

echo "✅ S3 sync complete!"

if [ -n "$DIST_ID" ]; then
  echo -e "\n🔄 Step 3: Invalidating CloudFront cache (Distribution: $DIST_ID)..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
  echo "✅ CloudFront invalidation triggered!"
fi

echo -e "\n🎉 Deployment finished successfully!"
