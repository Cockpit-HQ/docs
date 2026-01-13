# Advanced Usage

Headers, worker mode, logging, and programmatic execution.

[[toc]]

## Custom Headers

Add custom headers for authentication and metadata.

### Common Headers

| Header | Use Case |
|--------|----------|
| `Authorization` | API authentication |
| `X-Webhook-Secret` | Verify webhook origin |
| `Content-Type` | Already set to `application/json` |
| `X-Custom-Header` | Any custom metadata |

### Bearer Token Authentication

```
Key: Authorization
Value: Bearer ${API_TOKEN}
```

### Basic Authentication

```
Key: Authorization
Value: Basic ${BASE64_CREDENTIALS}
```

### API Key Header

```
Key: X-API-Key
Value: ${API_KEY}
```

### Multiple Headers

Add multiple headers for complex authentication:

```
Authorization: Bearer ${API_TOKEN}
X-Webhook-Secret: ${WEBHOOK_SECRET}
X-Source: cockpit-cms
```

## HMAC Signature Verification

For services requiring signature verification, implement a receiver that validates the payload:

```javascript
// Example: Node.js webhook receiver
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];

  if (!verifySignature(req.rawBody, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
  res.send('OK');
});
```

## Worker Mode

For high-traffic sites, offload webhook execution to background workers:

```php
// config/config.php
return [
    'webhooks' => [
        'worker' => true
    ]
];
```

This requires the worker system to be configured and running.

### Benefits

- **Non-blocking** - Content operations return immediately
- **Retry capability** - Failed webhooks can be retried
- **Rate limiting** - Control outbound request rate
- **Better performance** - Reduced response times for content operations

### Worker Configuration

```php
return [
    'worker' => [
        'enabled' => true,
        'driver' => 'redis', // or 'database', 'sync'
        'connection' => [
            'host' => '127.0.0.1',
            'port' => 6379
        ]
    ],
    'webhooks' => [
        'worker' => true,
        'retries' => 3,
        'retry_delay' => 60 // seconds
    ]
];
```

## Logging & Debugging

Failed webhooks are logged to the system log.

### Viewing Logs

1. Navigate to **Settings > System > Logs**
2. Filter by channel: `webhooks`
3. Review error messages and status codes

### Log Entry Structure

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "error",
  "channel": "webhooks",
  "message": "Webhook failed",
  "context": {
    "webhook": "deploy-trigger",
    "url": "https://api.example.com/webhook",
    "status_code": 401,
    "error": "Unauthorized"
  }
}
```

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Endpoint slow/unreachable | Check URL, increase timeout |
| 401 Unauthorized | Invalid authentication | Verify API keys/tokens |
| 403 Forbidden | Missing permissions | Check endpoint access |
| 404 Not Found | Wrong URL | Verify webhook URL |
| 500 Server Error | Endpoint error | Check receiving service |
| SSL certificate error | Invalid/expired cert | Fix certificate on endpoint |

### Debug Mode

Enable verbose logging temporarily:

```php
// config/config.php
return [
    'webhooks' => [
        'debug' => true
    ]
];
```

## Programmatic Execution

Execute webhooks from custom code.

### Get and Execute Webhook

```php
// Get webhook by name
$webhook = $app->helper('webhooks')->hook('my-webhook-name');

// Execute with custom payload
$result = $app->module('webhooks')->execute($webhook, [
    'custom' => 'data',
    'timestamp' => time()
]);

// Check result
if ($result['success']) {
    echo "Webhook sent successfully";
    echo "Status: " . $result['status_code'];
} else {
    echo "Error: " . $result['error']['message'];
}
```

### Response Structure

```php
[
    'success' => true,
    'status_code' => 200,
    'headers' => ['Content-Type' => 'application/json'],
    'content' => '{"received": true}',
    'duration_ms' => 150
]
```

### Error Response

```php
[
    'success' => false,
    'status_code' => 0,
    'error' => [
        'message' => 'Connection timed out',
        'code' => 28
    ],
    'duration_ms' => 30000
]
```

### Execute in Background

```php
// Queue webhook for background execution
$app->module('webhooks')->queue('my-webhook-name', [
    'custom' => 'payload'
]);
```

### Execute All Matching Webhooks

```php
// Trigger all webhooks listening to an event
$app->trigger('content.item.save', ['posts', $item, false]);
```

## Conditional Webhooks

Implement conditional webhook logic in custom code:

```php
$this->on('content.item.save', function($model, $item, $isNew) use ($app) {

    // Only trigger for published items
    if ($item['_state'] !== 1) return;

    // Only trigger for specific models
    if (!in_array($model, ['posts', 'news'])) return;

    // Custom webhook logic
    $webhook = $app->helper('webhooks')->hook('selective-deploy');
    $app->module('webhooks')->execute($webhook, [
        'model' => $model,
        'item_id' => $item['_id'],
        'action' => $isNew ? 'created' : 'updated'
    ]);
});
```

## Timeout Configuration

Configure webhook timeout settings:

```php
// config/config.php
return [
    'webhooks' => [
        'timeout' => 30,        // Connection timeout (seconds)
        'read_timeout' => 60,   // Read timeout (seconds)
    ]
];
```

## Rate Limiting

Implement rate limiting for high-frequency events:

```php
// Custom rate limiting in addon
$this->on('content.item.save', function($model, $item) use ($app) {

    $cacheKey = "webhook_rate_{$model}";
    $lastCall = $app->dataStorage->getKey('tmp', $cacheKey);

    // Only allow one webhook per 5 seconds per model
    if ($lastCall && (time() - $lastCall) < 5) {
        return;
    }

    $app->dataStorage->setKey('tmp', $cacheKey, time());

    // Execute webhook...
});
```
