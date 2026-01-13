# Email Notifications

Configure email alerts and customize notification templates.

[[toc]]

## Default Behavior

When notification emails are configured, Inbox sends an HTML email containing:

- Form name as the subject
- All submitted field values
- Links to uploaded files
- If an `email` field exists, it's set as the reply-to address

## Configuring Notifications

### Add Recipients

In form settings, add email addresses to the **Emails** field:

```
admin@example.com
support@example.com
```

### Custom Subject Line

Pass a custom subject with your form submission:

```html
<form action="/api/inbox/submit/{form-token}" method="POST">
    <input type="hidden" name="subject" value="New Contact Form Submission">
    <!-- other fields -->
</form>
```

### Reply-To Address

Name your email field `email` to automatically set it as the reply-to address:

```html
<input type="email" name="data[email]" placeholder="Your email" required>
```

## Custom Email Template

Override the default email template by creating:

```
/config/inbox/layouts/email.php
```

### Basic Template

```php
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Contact: <?=$form['name']?></title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #333; color: white; padding: 20px; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Submission: <?=$form['name']?></h1>
    </div>

    <div class="content">
        <?php foreach ($data as $field => $value): ?>
        <div class="field">
            <div class="label"><?=ucfirst($field)?></div>
            <div>
                <?php if (is_string($value)): ?>
                    <?=nl2br(htmlspecialchars($value))?>
                <?php else: ?>
                    <pre><?=json_encode($value, JSON_PRETTY_PRINT)?></pre>
                <?php endif ?>
            </div>
        </div>
        <?php endforeach; ?>

        <?php if (count($attachments)): ?>
        <div class="field">
            <div class="label">Attachments</div>
            <?php foreach ($attachments as $field => $files): ?>
                <?php foreach ($files as $file): ?>
                    <a href="<?=$this->fileStorage->getURL("uploads://{$file['file']}")?>"><?=$file['name']?></a><br>
                <?php endforeach; ?>
            <?php endforeach; ?>
        </div>
        <?php endif ?>
    </div>
</body>
</html>
```

### Available Variables

| Variable | Description |
|----------|-------------|
| `$form` | Form configuration object |
| `$data` | Submitted field values |
| `$attachments` | Uploaded file information |

### Form Object Properties

```php
$form['name']       // Form display name
$form['_id']        // Form ID
$form['group']      // Form group
$form['color']      // Form color
```

### Attachments Structure

```php
$attachments = [
    'resume' => [
        [
            'name' => 'john-doe-resume.pdf',
            'file' => 'inbox/uploads/abc123/2024-01/john-doe-resume.pdf',
            'size' => 245000,
            'mime' => 'application/pdf'
        ]
    ],
    'documents' => [
        // Multiple files if input had "multiple"
    ]
];
```

## Advanced Template Example

A more sophisticated template with branding and conditional sections:

```php
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?=$form['name']?> - New Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content { padding: 30px; }
        .field {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .value {
            font-size: 16px;
        }
        .attachments {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .attachment-link {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            margin: 5px 5px 5px 0;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><?=$form['name']?></h1>
            <p>New submission received</p>
        </div>

        <div class="content">
            <?php foreach ($data as $field => $value): ?>
                <?php if ($value): ?>
                <div class="field">
                    <div class="label"><?=ucfirst(str_replace('_', ' ', $field))?></div>
                    <div class="value">
                        <?php if (is_array($value)): ?>
                            <pre style="margin: 0; font-family: inherit;"><?=json_encode($value, JSON_PRETTY_PRINT)?></pre>
                        <?php elseif (filter_var($value, FILTER_VALIDATE_EMAIL)): ?>
                            <a href="mailto:<?=htmlspecialchars($value)?>"><?=htmlspecialchars($value)?></a>
                        <?php elseif (filter_var($value, FILTER_VALIDATE_URL)): ?>
                            <a href="<?=htmlspecialchars($value)?>"><?=htmlspecialchars($value)?></a>
                        <?php else: ?>
                            <?=nl2br(htmlspecialchars($value))?>
                        <?php endif ?>
                    </div>
                </div>
                <?php endif ?>
            <?php endforeach; ?>

            <?php if (count($attachments)): ?>
            <div class="field">
                <div class="label">Attachments</div>
                <div class="attachments">
                    <?php foreach ($attachments as $field => $files): ?>
                        <?php foreach ($files as $file): ?>
                            <a class="attachment-link" href="<?=$this->fileStorage->getURL("uploads://{$file['file']}")?>">
                                📎 <?=$file['name']?>
                            </a>
                        <?php endforeach; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif ?>
        </div>

        <div class="footer">
            Sent from <?=$form['name']?> via Cockpit CMS<br>
            <?=date('F j, Y \a\t g:i a')?>
        </div>
    </div>
</body>
</html>
```

## Form-Specific Templates

Create templates for specific forms by naming them with the form ID:

```
/config/inbox/layouts/email-{form-id}.php
```

For example:
```
/config/inbox/layouts/email-abc123.php
```

## Mail Configuration

Ensure Cockpit's mail settings are configured in `/config/config.php`:

```php
return [
    'mailer' => [
        'from' => 'noreply@example.com',
        'from_name' => 'My Website',

        // SMTP settings (optional)
        'transport' => 'smtp',
        'host' => 'smtp.example.com',
        'port' => 587,
        'auth' => true,
        'user' => 'smtp-user',
        'password' => 'smtp-password'
    ]
];
```
