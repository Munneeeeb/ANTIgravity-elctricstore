# n8n Webhook Integration Guide - Al Muneeb Electric Store

## Webhook Configuration

**Webhook URL**: `http://localhost:5678/webhook/5fd3290b-4e63-45fa-b98c-a09beb67a618`

All forms on the website now send data to this n8n webhook endpoint.

## Data Structures

### 1. Lead Capture Form (Homepage)
**Form Location**: index.html - Main lead capture section

**Data Sent**:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "timestamp": "2025-12-11T19:30:00.000Z",
  "source": "Lead Capture Form",
  "page": "http://yourwebsite.com/index.html"
}
```

**Fields**:
- `name` - Customer's full name
- `email` - Customer's email address
- `phone` - Customer's phone number
- `timestamp` - ISO 8601 timestamp of submission
- `source` - Always "Lead Capture Form"
- `page` - URL where form was submitted

---

### 2. Newsletter Signup Form (Homepage Footer)
**Form Location**: index.html - Newsletter section in footer

**Data Sent**:
```json
{
  "email": "subscriber@example.com",
  "timestamp": "2025-12-11T19:30:00.000Z",
  "source": "Newsletter Signup",
  "page": "http://yourwebsite.com/index.html"
}
```

**Fields**:
- `email` - Subscriber's email address
- `timestamp` - ISO 8601 timestamp of submission
- `source` - Always "Newsletter Signup"
- `page` - URL where form was submitted

---

### 3. Contact Form (Contact Page)
**Form Location**: contact.html - Main contact form

**Data Sent**:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry Subject",
  "message": "Customer's message here...",
  "timestamp": "2025-12-11T19:30:00.000Z",
  "source": "Contact Form",
  "page": "http://yourwebsite.com/contact.html"
}
```

**Fields**:
- `name` - Customer's full name
- `email` - Customer's email address
- `phone` - Customer's phone number (optional)
- `subject` - Subject of inquiry
- `message` - Customer's message
- `timestamp` - ISO 8601 timestamp of submission
- `source` - Always "Contact Form"
- `page` - URL where form was submitted

---

### 4. Purchase/Pricing Button Clicks
**Form Location**: index.html - Pricing section buttons

**Data Sent**:
```json
{
  "plan": "Professional",
  "price": 99,
  "timestamp": "2025-12-11T19:30:00.000Z",
  "page": "http://yourwebsite.com/index.html",
  "userAgent": "Mozilla/5.0..."
}
```

**Fields**:
- `plan` - Name of selected plan (Starter/Professional/Enterprise)
- `price` - Price of the plan
- `timestamp` - ISO 8601 timestamp of click
- `page` - URL where button was clicked
- `userAgent` - Browser user agent string

---

## How It Works

1. **Form Submission**: User fills out any form on the website
2. **JavaScript Handler**: Form data is captured by JavaScript functions
3. **Webhook POST**: Data is sent via POST request to your n8n webhook
4. **Fallback Storage**: If webhook fails, data is stored in browser localStorage
5. **Success Message**: User sees success modal confirmation

## Testing the Integration

### Test Lead Form:
1. Go to homepage (index.html)
2. Scroll to "Ready to Power Your Project?" section
3. Fill in Name, Email, Phone
4. Click "Request a Quote"
5. Check n8n workflow for incoming data

### Test Newsletter:
1. Go to homepage (index.html)
2. Scroll to footer newsletter section
3. Enter email address
4. Click "Subscribe"
5. Check n8n workflow for incoming data

### Test Contact Form:
1. Go to contact.html
2. Fill in all fields (Name, Email, Phone, Subject, Message)
3. Click "Send Message"
4. Check n8n workflow for incoming data

## n8n Workflow Setup Recommendations

### Suggested n8n Workflow Structure:

```
Webhook Trigger
    ↓
[Switch Node] - Route based on "source" field
    ↓
├─→ Lead Capture Form → [Your CRM/Database]
├─→ Newsletter Signup → [Email Marketing Tool]
├─→ Contact Form → [Email Notification + CRM]
└─→ Purchase Intent → [Sales Notification]
```

### Example n8n Nodes to Use:

1. **Webhook Node** (Already configured)
   - Method: POST
   - Path: /webhook/5fd3290b-4e63-45fa-b98c-a09beb67a618

2. **Switch Node** - Route by source:
   - Route 1: `{{ $json.source }} === "Lead Capture Form"`
   - Route 2: `{{ $json.source }} === "Newsletter Signup"`
   - Route 3: `{{ $json.source }} === "Contact Form"`
   - Route 4: Check for `plan` field (purchase intent)

3. **Possible Actions**:
   - Send email notification
   - Add to Google Sheets
   - Add to Airtable
   - Add to CRM (HubSpot, Salesforce, etc.)
   - Send to Slack/Discord
   - Add to email marketing (Mailchimp, SendGrid, etc.)

## Local Storage Fallback

If the webhook is unavailable, data is stored locally in the browser.

### To Export Stored Data:
1. Open browser console (F12)
2. Run: `exportStoredData()`
3. A JSON file will download with all stored leads and newsletter signups

### Storage Keys:
- `leads` - Lead capture form submissions
- `newsletter` - Newsletter signups
- `contacts` - Contact form submissions

## Important Notes

⚠️ **Localhost Webhook**: Your webhook is currently set to `http://localhost:5678`. This will only work when:
- n8n is running on your local machine
- The website is accessed from the same machine
- Both are on the same network

🌐 **For Production**: Replace with your public n8n webhook URL:
```javascript
LEAD_WEBHOOK: 'https://your-n8n-instance.com/webhook/5fd3290b-4e63-45fa-b98c-a09beb67a618'
```

## Troubleshooting

### Webhook Not Receiving Data:
1. ✅ Check n8n is running: `http://localhost:5678`
2. ✅ Verify webhook is active in n8n workflow
3. ✅ Check browser console for errors (F12)
4. ✅ Test webhook directly with curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/5fd3290b-4e63-45fa-b98c-a09beb67a618 \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### CORS Issues:
If you see CORS errors, configure n8n webhook to allow CORS:
- In n8n webhook settings, enable "Respond Immediately"
- Add CORS headers if needed

### Data Not Appearing:
1. Check n8n execution log
2. Verify webhook path is correct
3. Check browser network tab (F12 → Network)
4. Look for localStorage fallback data

## Next Steps

1. ✅ Webhook configured in script.js
2. ⏳ Set up n8n workflow to process incoming data
3. ⏳ Test all forms
4. ⏳ Configure email notifications in n8n
5. ⏳ Set up database/CRM integration
6. ⏳ For production: Update to public webhook URL

---

**All forms are now connected to your n8n webhook!** 🎉
