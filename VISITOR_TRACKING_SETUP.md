# Visitor Tracking System Setup

## Overview
This system tracks all visitors to kunalpatil.me and displays analytics in the admin panel.

## What Was Created

### 1. Database Model (`server/models/View.js`)
- Stores visitor information including:
  - IP address
  - User agent
  - Page path
  - Referrer
  - Device type (Desktop/Mobile/Tablet)
  - Browser name
  - Timestamp

### 2. API Routes (`server/routes/views.js`)
- `POST /api/views/track` - Track a page view (PUBLIC, no auth required)
- `GET /api/views` - Get all views with pagination (ADMIN)
- `GET /api/views/stats` - Get analytics statistics (ADMIN)
- `DELETE /api/views/:viewId` - Delete a specific view (ADMIN)
- `DELETE /api/views` - Clear all views (ADMIN)

### 3. Client Tracking (`src/lib/tracking.ts`)
- Automatically tracks page views on every route change
- Sends visitor data to API
- Fails silently to not disrupt user experience

### 4. Admin Panel (`admin/src/pages/Views.tsx`)
- Dashboard with key metrics:
  - Total views
  - Unique visitors
  - Last 24 hours views
  - Last 7 days views
- Top pages list
- Device breakdown (Desktop/Mobile/Tablet)
- Browser breakdown
- Full visitor log with pagination
- Clear all views button

## How It Works

1. **User visits kunalpatil.me**
   - PageViewTracker component detects route change
   - Calls trackPageView() function
   - Sends POST request to /api/views/track

2. **Server receives tracking request**
   - Extracts IP address from request headers
   - Parses user agent to detect browser and device
   - Saves to MongoDB Views collection

3. **Admin views analytics**
   - Navigate to /views in admin panel
   - See real-time visitor statistics
   - View detailed visitor logs
   - Export or clear data as needed

## Deployment Steps

1. **Deploy Server Changes**
   ```bash
   cd server
   git add .
   git commit -m "Add visitor tracking system"
   git push
   ```

2. **Deploy Client Changes**
   ```bash
   cd src
   git add .
   git commit -m "Add visitor tracking"
   git push
   ```

3. **Deploy Admin Changes**
   ```bash
   cd admin
   git add .
   git commit -m "Add Views analytics page"
   git push
   ```

## Features

✅ Automatic tracking on all pages
✅ IP address capture
✅ Device detection (Desktop/Mobile/Tablet)
✅ Browser detection
✅ Referrer tracking
✅ Real-time analytics
✅ Pagination for large datasets
✅ Privacy-friendly (no cookies, no personal data)
✅ Admin-only access to view data

## Privacy Notes

- Only tracks IP addresses and technical information
- No personal data or cookies stored
- Data can be cleared anytime from admin panel
- Tracking fails silently if blocked

## Testing

1. Visit https://kunalpatil.me
2. Navigate to different pages
3. Login to admin panel at https://admin.kunalpatil.me
4. Click "Views" in sidebar
5. See your visits tracked!
