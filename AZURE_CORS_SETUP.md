# Azure Blob Storage CORS Configuration

## Problem
Canvas files are being saved to Azure successfully, but the browser cannot fetch them due to CORS policy:
```
Access to fetch at 'https://notesportfolio.blob.core.windows.net/...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Configure CORS on Azure Storage Account

### Step 1: Go to Azure Portal
1. Navigate to https://portal.azure.com
2. Sign in with your Azure account

### Step 2: Find Your Storage Account
1. Search for "Storage accounts" in the top search bar
2. Click on your storage account: **notesportfolio**

### Step 3: Configure CORS
1. In the left sidebar, scroll down to **Settings** section
2. Click on **Resource sharing (CORS)**
3. Click on the **Blob service** tab

### Step 4: Add CORS Rule
Add a new rule with these settings:

| Field | Value |
|-------|-------|
| **Allowed origins** | `https://www.kunalpatil.me,https://kunalpatil.me,http://localhost:3002` |
| **Allowed methods** | `GET, PUT, POST, DELETE, HEAD, OPTIONS` |
| **Allowed headers** | `*` |
| **Exposed headers** | `*` |
| **Max age** | `3600` |

### Step 5: Save
1. Click **Save** at the top of the page
2. Wait for the confirmation message

## Verification
After configuring CORS:
1. Reload your application at https://www.kunalpatil.me
2. Open a DSA project and select a file
3. Check browser console - CORS errors should be gone
4. Canvas should load successfully

## Alternative: Azure CLI Method
If you prefer using Azure CLI:

```bash
az storage cors add \
  --services b \
  --methods GET PUT POST DELETE HEAD OPTIONS \
  --origins "https://www.kunalpatil.me" "https://kunalpatil.me" "http://localhost:3002" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name notesportfolio
```

## Notes
- CORS changes take effect immediately
- You can add more origins later if needed
- The `*` in headers means all headers are allowed (safe for your use case)
- Max age of 3600 seconds (1 hour) means browsers will cache the CORS preflight response
