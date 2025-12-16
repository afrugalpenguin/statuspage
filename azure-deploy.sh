#!/bin/bash
# Azure App Service Deployment Script
# Run: chmod +x azure-deploy.sh && ./azure-deploy.sh

set -e

# Configuration - EDIT THESE VALUES
RESOURCE_GROUP="statuspage-rg"
APP_NAME="my-statuspage"
LOCATION="uksouth"
SKU="B1"

echo "=== Status Page - Azure Deployment ==="

# Login check
echo "Checking Azure login..."
az account show > /dev/null 2>&1 || az login

# Create resource group
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
echo "Creating App Service plan..."
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux

# Create Web App with Node.js
echo "Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "NODE:20-lts"

# Configure app settings
echo "Configuring app settings..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    PORT=3001 \
    NODE_ENV=production \
    WEBSITES_PORT=3001

# Configure startup command
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "npx tsx server/index.ts"

# Enable logging
az webapp log config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-container-logging filesystem

# Deploy using ZIP
echo "Building and deploying..."
npm run build
zip -r deploy.zip . -x "node_modules/*" -x ".git/*" -x "*.log"

az webapp deployment source config-zip \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src deploy.zip

rm deploy.zip

# Get URL
URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
echo ""
echo "=== Deployment Complete ==="
echo "Status Page: https://$URL"
echo "Widget URL:  https://$URL/widget.iife.js"
echo ""
echo "Embed code:"
echo '<script src="https://'$URL'/widget.iife.js"></script>'
echo '<cenatasure-status></cenatasure-status>'
