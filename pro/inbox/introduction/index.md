# Inbox

Collect and manage form submissions with built-in spam protection and email notifications.

[[toc]]

## Overview

The Inbox addon streamlines collecting and managing form submissions from your website or application. It captures form data including file uploads and stores everything securely within Cockpit, with built-in spam protection and email notifications.

## Features

- **Simple integration** - Submit forms via a single API endpoint
- **File uploads** - Accept and store file attachments securely
- **Spam protection** - Honeypot fields, domain restrictions, and language detection
- **Email notifications** - Get notified when new submissions arrive
- **Custom email templates** - Customize notification emails to your needs
- **Field whitelisting** - Accept only specific fields for security
- **Dashboard widget** - View recent submissions at a glance
- **AJAX support** - Submit forms without page reload
- **Events system** - Hook into submissions for custom workflows

## Use Cases

### Contact Forms
Collect inquiries from website visitors with email notifications.

### Job Applications
Accept resumes and cover letters with file upload support.

### Newsletter Signups
Build mailing lists with email field capture.

### Feedback Collection
Gather user feedback and bug reports from your application.

### Event Registration
Collect attendee information for events and webinars.

## Quick Start

### 1. Create a Form

Navigate to **Settings > Inbox** and create a new form. You'll receive a unique form token.

### 2. Build Your HTML Form

```html
<form action="/api/inbox/submit/{form-token}" method="POST">
    <label for="name">Name</label>
    <input type="text" id="name" name="data[name]" required>

    <label for="email">Email</label>
    <input type="email" id="email" name="data[email]" required>

    <label for="message">Message</label>
    <textarea id="message" name="data[message]" required></textarea>

    <button type="submit">Send</button>
</form>
```

### 3. View Submissions

Submissions appear in **Settings > Inbox > [Your Form]**. You'll also receive email notifications if configured.

## Form Configuration

### Basic Settings

| Field | Description |
|-------|-------------|
| **Name** | Display name for the form |
| **Group** | Organize forms into groups |
| **Color** | Visual identifier in the admin |
| **Info** | Internal notes about the form |

### Notification Settings

| Field | Description |
|-------|-------------|
| **Emails** | List of email addresses to notify on submission |

### Security Settings

| Field | Description |
|-------|-------------|
| **Domains** | Allowed referrer domains (leave empty for any) |
| **Fields** | Whitelist of accepted field names |
| **Honeypot** | Hidden field name for spam detection |
| **Languages** | Allowed content languages |

## Best Practices

### Security

- Always use **field whitelisting** to accept only expected fields
- Enable **honeypot** for public-facing forms
- Use **domain restrictions** to prevent cross-site submissions
- Enable **language detection** if you only serve specific regions

### User Experience

- Use AJAX submissions for a smoother experience
- Show clear success/error messages
- Implement loading states during submission
- Provide file upload progress for large files

### Data Management

- Regularly export and backup important submissions
- Use groups to organize forms by project or purpose
- Mark spam submissions to train your filtering

## Troubleshooting

### Form not found (404)

- Verify the form token in your form's action URL
- Check that the form exists in Inbox settings
- Ensure the form hasn't been deleted

### Submission rejected (412)

- **"Not allowed"** - Check domain restrictions match your website
- **"Item data is missing"** - Ensure fields use `name="data[fieldname]"` format
- **"Precondition failed"** - Content language doesn't match whitelist
- **"Upload failed"** - File type blocked or upload error

### Emails not sending

- Verify notification emails are configured in form settings
- Check Cockpit's mail settings (`/config/config.php`)
- Review system logs for mail errors
- Test with a simple mail configuration first

### Files not uploading

- Add `enctype="multipart/form-data"` to your form tag
- Check PHP's `upload_max_filesize` and `post_max_size` settings
- Ensure storage directory is writable
- File type may be blocked for security
