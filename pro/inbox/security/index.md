# Security & Spam Protection

Protect your forms from spam and malicious submissions.

[[toc]]

## Honeypot Field

Add a hidden field that bots will fill but humans won't:

```html
<form action="/api/inbox/submit/{form-token}" method="POST">
    <!-- Honeypot - hidden from users -->
    <div style="display: none;">
        <input type="text" name="data[website]" tabindex="-1" autocomplete="off">
    </div>

    <label for="email">Email</label>
    <input type="email" name="data[email]" required>

    <label for="message">Message</label>
    <textarea name="data[message]" required></textarea>

    <button type="submit">Send</button>
</form>
```

In your form settings, set **Honeypot** to `website`. If the field contains any value, the submission is silently discarded (returns success to fool bots).

### Honeypot Best Practices

- Use realistic field names like `website`, `url`, `company`
- Hide with CSS (`display: none`) not `type="hidden"`
- Add `tabindex="-1"` to prevent keyboard navigation
- Add `autocomplete="off"` to prevent autofill

## Domain Restrictions

Limit form submissions to specific referrer domains:

1. In form settings, add allowed domains to **Domains** (e.g., `example.com`, `www.example.com`)
2. Submissions from other domains receive a `412 Precondition Failed` error

This prevents forms from being submitted from unauthorized websites.

### Domain Configuration

```
example.com
www.example.com
staging.example.com
```

:::tip
Include all domains and subdomains where your form is hosted. Don't include the protocol (http/https).
:::

## Language Detection

Filter submissions by detected language to reduce foreign-language spam:

1. In form settings, add allowed languages to **Languages** (e.g., `en`, `de`, `fr`)
2. Text fields longer than 50 characters are analyzed
3. If the detected language doesn't match the whitelist, submission is rejected

### Supported Languages

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `fr` | French |
| `de` | German | `es` | Spanish |
| `it` | Italian | `pt` | Portuguese |
| `nl` | Dutch | `pl` | Polish |
| `ru` | Russian | `zh` | Chinese |
| `ja` | Japanese | `ko` | Korean |
| `ar` | Arabic | `hi` | Hindi |

Full list: `am`, `ar`, `az`, `be`, `bg`, `bn`, `ca`, `cs`, `da`, `de`, `el`, `en`, `es`, `et`, `eu`, `fa`, `fi`, `fr`, `gu`, `he`, `hi`, `hr`, `hu`, `hy`, `is`, `it`, `ja`, `ka`, `kn`, `ko`, `ku`, `lo`, `lt`, `lv`, `ml`, `mr`, `ms`, `nl`, `no`, `or`, `pa`, `pl`, `pt`, `ro`, `ru`, `sk`, `sl`, `sq`, `sr`, `sv`, `ta`, `te`, `th`, `tl`, `tr`, `uk`, `ur`, `vi`, `yo`, `zh`

## Field Whitelisting

Only accept specific fields by adding field names to **Fields** in security settings:

```
name
email
message
phone
```

Any field not in this list is ignored. Leave empty to accept all fields.

### Benefits

- Prevents injection of unexpected data
- Reduces database storage
- Blocks additional fields added by bots

## File Upload Security

Inbox automatically blocks dangerous file types.

### Blocked Extensions

- `bat` - Batch files
- `exe` - Executables
- `sh` - Shell scripts
- `php`, `phar`, `phtml`, `phps` - PHP files
- `htm`, `html`, `xhtml` - HTML files
- `htaccess` - Apache config

### Blocked MIME Types

- `application/x-httpd-php`
- `application/x-php`
- `text/x-php`
- `text/html`
- `application/xhtml+xml`

### File Storage

Files are stored in:
```
/storage/uploads/inbox/uploads/{form-id}/{date}/
```

## Combining Protections

For maximum security, enable multiple layers:

```php
// Form settings
[
    'honeypot' => 'website',
    'domains' => ['example.com', 'www.example.com'],
    'languages' => ['en', 'de'],
    'fields' => ['name', 'email', 'message']
]
```

### Protection Layers

1. **Honeypot** - Catches automated bots
2. **Domain restrictions** - Prevents cross-site submissions
3. **Language detection** - Blocks foreign spam
4. **Field whitelisting** - Limits accepted data

## reCAPTCHA Integration

For additional protection, implement reCAPTCHA client-side and validate server-side:

```javascript
// Submit with reCAPTCHA token
async function submitWithRecaptcha(form) {
    const token = await grecaptcha.execute('your-site-key', { action: 'submit' });

    const formData = new FormData(form);
    formData.append('data[recaptcha_token]', token);

    const response = await fetch(form.action, {
        method: 'POST',
        body: formData
    });

    return response.json();
}
```

Validate in a `inbox.submit.before` event:

```php
$app->on('inbox.submit.before', function($form, &$record) {
    $token = $record['data']['recaptcha_token'] ?? null;

    if (!$token) {
        throw new \Exception('reCAPTCHA required');
    }

    // Verify with Google
    $response = file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify?' .
        http_build_query([
            'secret' => $_ENV['RECAPTCHA_SECRET'],
            'response' => $token
        ])
    );

    $result = json_decode($response, true);

    if (!$result['success'] || $result['score'] < 0.5) {
        throw new \Exception('reCAPTCHA validation failed');
    }

    // Remove token from stored data
    unset($record['data']['recaptcha_token']);
});
```
