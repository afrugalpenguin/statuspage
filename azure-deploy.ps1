# Azure App Service Deployment Script (PowerShell)
# Run: .\azure-deploy.ps1

$ErrorActionPreference = "Stop"

# Configuration - EDIT THESE VALUES
$RESOURCE_GROUP = "statuspage-rg"
$APP_NAME = "my-statuspage"
$LOCATION = "uksouth"
$SKU = "B1"

Write-Host "=== Status Page - Azure Deployment ===" -ForegroundColor Cyan

# Login check
Write-Host "Checking Azure login..."
try {
    az account show | Out-Null
} catch {
    az login
}

# Create resource group
Write-Host "Creating resource group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
Write-Host "Creating App Service plan..." -ForegroundColor Yellow
az appservice plan create `
  --name "$APP_NAME-plan" `
  --resource-group $RESOURCE_GROUP `
  --sku $SKU `
  --is-linux

# Create Web App with Node.js
Write-Host "Creating Web App..." -ForegroundColor Yellow
az webapp create `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --plan "$APP_NAME-plan" `
  --runtime "NODE:20-lts"

# Configure app settings
Write-Host "Configuring app settings..." -ForegroundColor Yellow
az webapp config appsettings set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings PORT=3001 NODE_ENV=production WEBSITES_PORT=3001

# Configure startup command
az webapp config set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --startup-file "npx tsx server/index.ts"

# Enable logging
az webapp log config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-container-logging filesystem

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path * -DestinationPath deploy.zip -Force

# Deploy
Write-Host "Deploying to Azure..." -ForegroundColor Yellow
az webapp deployment source config-zip `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --src deploy.zip

Remove-Item deploy.zip

# Get URL
$URL = az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Status Page: https://$URL" -ForegroundColor Cyan
Write-Host "Widget URL:  https://$URL/widget.iife.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Embed code:" -ForegroundColor Yellow
Write-Host "<script src=`"https://$URL/widget.iife.js`"></script>"
Write-Host "<cenatasure-status></cenatasure-status>"
