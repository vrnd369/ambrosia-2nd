# Google Sheets Newsletter Integration — Setup Guide

## Overview

This integration uses **Google Apps Script** as a free, serverless API to receive newsletter signups from the Ambrosia website and store them in a Google Sheet. No backend server required.

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like **"Ambrosia Newsletter Subscribers"**
3. In **Row 1**, add these two headers:

| A    | B     |
|------|-------|
| Date | Email |

4. (Optional) Name the first sheet tab `Subscribers`

---

## Step 2: Create the Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Paste the following code:

```javascript
// ─── Configuration ─────────────────────────────────────────────────────────
const SHEET_NAME = 'Subscribers'; // Must match your sheet tab name
const MAX_ROWS = 50000;           // Safety limit

// ─── Main handler for POST requests ───────────────────────────────────────
function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000); // Wait up to 10s to avoid race conditions

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return buildResponse(500, 'Sheet not found');
    }

    // Safety: prevent sheet from growing too large
    if (sheet.getLastRow() >= MAX_ROWS) {
      return buildResponse(429, 'Subscription limit reached');
    }

    const data = JSON.parse(e.postData.contents);
    const email = (data.email || '').trim().toLowerCase();

    // Server-side email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return buildResponse(400, 'Invalid email');
    }

    // Duplicate check: search existing emails in column B
    const existingEmails = sheet.getRange('B2:B' + sheet.getLastRow()).getValues().flat();
    if (existingEmails.includes(email)) {
      return buildResponse(409, 'Already subscribed');
    }

    // Append new row: Date | Email
    sheet.appendRow([
      data.date || new Date().toISOString(),
      email
    ]);

    lock.releaseLock();
    return buildResponse(200, 'Subscribed successfully');

  } catch (error) {
    return buildResponse(500, 'Server error: ' + error.message);
  }
}

// ─── Handle GET requests (for testing) ────────────────────────────────────
function doGet(e) {
  return buildResponse(200, 'Ambrosia Newsletter API is running');
}

// ─── Response builder ─────────────────────────────────────────────────────
function buildResponse(status, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ status, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (Ctrl+S) and name the project **"Ambrosia Newsletter API"**

---

## Step 3: Deploy as a Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: `Newsletter signup endpoint`
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` ← **IMPORTANT** (this allows anonymous form submissions)
4. Click **Deploy**
5. **Authorize** the script when prompted (click through the "unverified app" warning — this is your own script)
6. **Copy the Web App URL** — it will look like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

## Step 4: Add the URL to your `.env` file

Open `/.env` in your project root and add:

```env
VITE_GOOGLE_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec
```

> ⚠️ **Important**: After changing `.env`, restart the dev server (`npm run dev`) for the changes to take effect.

---

## Step 5: Test

1. Restart your dev server
2. Go to the footer on your website
3. Enter an email and click **Subscribe**
4. Check your Google Sheet — a new row should appear with the date and email!

---

## How It Works

```
User enters email → React validates → fetch POST to Apps Script URL
                                            ↓
                                    Apps Script validates
                                    Checks for duplicates
                                    Appends row: Date | Email
                                            ↓
                                    React shows success message ✓
```

---

## Production Notes

### Security
- The Apps Script includes **server-side email validation** and **duplicate checking**
- A **script lock** prevents race conditions from concurrent submissions
- A **MAX_ROWS limit** prevents the sheet from growing unbounded
- The `no-cors` mode means the response is opaque to the browser, but the data still reaches the sheet

### Updating the Script
If you modify the Apps Script code:
1. Go to **Deploy → Manage deployments**
2. Click the **pencil icon** ✏️ on your deployment
3. Change **Version** to `New version`
4. Click **Deploy**

### Monitoring
- Check the Google Sheet directly for new signups
- In Apps Script, go to **Executions** (left sidebar) to see logs and errors
- Set up Google Sheet **notifications** (Tools → Notification rules) to get email alerts for new submissions

### Rate Limits
- Google Apps Script: ~20,000 requests/day (free tier) — more than enough for newsletter signups
- If you need higher limits, consider upgrading to Google Workspace
