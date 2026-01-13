# Advanced Usage

Events, permissions, and troubleshooting for Sync.

[[toc]]

## Events

### sync.push.finished

Triggered after a push sync completes:

```php
$app->on('sync.push.finished', function($target) {
    // Notify team
    $this->mailer->mail(
        'team@example.com',
        'Content pushed to ' . $target['uri'],
        'Sync completed successfully.'
    );

    // Clear caches
    $this->helper('cache')->flush();
});
```

### sync.pull.finished

Triggered after a pull sync completes:

```php
$app->on('sync.pull.finished', function($target) {
    // Rebuild search index
    $this->module('detektivo')->index();

    // Log the sync
    $this->module('system')->log(
        "Pulled data from {$target['uri']}",
        channel: 'sync',
        type: 'info'
    );
});
```

### sync.item.pushed

Triggered when an individual item is synced:

```php
$app->on('sync.item.pushed', function($type, $target, $item) {
    // Log individual item syncs
    $this->module('system')->log(
        "Synced {$type} item {$item['_id']} to {$target['uri']}",
        channel: 'sync',
        type: 'info'
    );
});
```

## Permissions

| Permission | Description |
|------------|-------------|
| `sync/manage` | Full access to sync configuration and execution |

### Role Configuration

```php
// Only administrators should have sync access
[
    'name' => 'Administrator',
    'permissions' => [
        'sync/manage' => true
    ]
]

// Content editors typically don't need sync access
[
    'name' => 'Editor',
    'permissions' => [
        'sync/manage' => false
    ]
]
```

## Troubleshooting

### Sync Not Starting

- Check that a sync job isn't already running
- Verify the target URL is accessible
- Confirm sync keys match on both ends
- Check server logs for errors

### Connection Errors

- Verify target server is reachable
- Check firewall rules allow connections
- Ensure HTTPS certificates are valid
- Test with curl:

```bash
curl -X POST https://target/api/sync/check \
  -H "Content-Type: application/json" \
  -d '{"syncKey": "your-key"}'
```

### Assets Not Transferring

- Verify both servers can access each other's uploads
- Check file permissions on upload directories
- Ensure upload URLs are publicly accessible
- Large files may timeout - consider increasing limits

### Sync Lock Issues

If sync appears stuck, reset the lock:

1. Go to **Settings > Sync**
2. Click **Reset** to clear the lock file

Or manually remove: `/storage/tmp/sync.lock`

### Data Conflicts

- Sync uses IDs to match records - same IDs will be updated
- Mirror mode will remove data not in the source
- Use "Missing Keys Only" for translations to preserve edits

### Debugging

Enable verbose logging:

```php
// config/config.php
return [
    'debug' => true,
    'sync' => [
        'syncKey' => '...'
    ]
];
```

Check sync logs at **Settings > System > Logs** filtered by channel: `sync`

## Performance Optimization

### Large Dataset Handling

For datasets with thousands of items:

```php
// Batch sync by model
$models = ['posts', 'products', 'pages'];

foreach ($models as $model) {
    $jobs = [
        [
            'name' => 'content',
            'syncSettings' => [
                'models' => [$model],
                'batchSize' => 100
            ]
        ]
    ];

    Cockpit()->helper('sync')->run($target, $jobs);

    // Allow some delay between batches
    sleep(2);
}
```

### Asset Sync Optimization

For large media libraries:

```php
// Sync only recently modified assets
$jobs = [
    [
        'name' => 'assets',
        'syncSettings' => [
            'modifiedSince' => strtotime('-7 days'),
            'skipLargeFiles' => true,
            'maxFileSize' => 10 * 1024 * 1024 // 10MB
        ]
    ]
];
```

### Timeout Configuration

Adjust PHP timeout for large syncs:

```php
// In sync script
set_time_limit(3600); // 1 hour
ini_set('memory_limit', '512M');
```

## Security Considerations

### Key Rotation

Periodically rotate sync keys:

1. Generate new key on target server
2. Update target configuration with new key
3. Test connectivity
4. Remove old key

### Network Security

```php
// Restrict sync to specific IPs
$app->on('sync.request.before', function() {
    $allowedIPs = ['192.168.1.100', '10.0.0.50'];

    if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs)) {
        throw new \Exception('Sync request from unauthorized IP');
    }
});
```

### Audit Logging

Log all sync operations:

```php
$app->on('sync.push.finished', function($target) use ($app) {
    $app->dataStorage->save('sync/audit_log', [
        'action' => 'push',
        'target' => $target['uri'],
        'user' => $app->helper('auth')->getUser()['user'] ?? 'system',
        'timestamp' => time(),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null
    ]);
});
```

## Custom Sync Handlers

### Pre-Sync Hook

Modify data before sync:

```php
$app->on('sync.content.before', function(&$items) {
    foreach ($items as &$item) {
        // Strip internal fields
        unset($item['_internalNotes']);

        // Transform data for production
        if (isset($item['debugMode'])) {
            $item['debugMode'] = false;
        }
    }
});
```

### Post-Sync Hook

Actions after sync completes:

```php
$app->on('sync.content.after', function($items, $target) use ($app) {
    // Trigger cache invalidation on target
    $app->helper('async')->run(function() use ($target) {
        file_get_contents("{$target['uri']}/api/cache/clear");
    });
});
```

## Monitoring

### Sync Status API

Create an endpoint to check sync status:

```php
// config/api/sync-status.php
return function() {
    $lockFile = $this->path('#tmp:') . '/sync.lock';

    return [
        'syncing' => file_exists($lockFile),
        'lastSync' => $this->dataStorage->findOne('sync/log', [
            'sort' => ['timestamp' => -1]
        ])
    ];
};
```

### Health Check

Monitor sync connectivity:

```php
// health-check.php
$targets = [
    ['name' => 'Production', 'uri' => 'https://cms.example.com'],
    ['name' => 'Staging', 'uri' => 'https://staging.example.com'],
];

foreach ($targets as $target) {
    $response = @file_get_contents("{$target['uri']}/api/sync/check");

    if ($response && json_decode($response)->success) {
        echo "✅ {$target['name']}: Connected\n";
    } else {
        echo "❌ {$target['name']}: Unreachable\n";
    }
}
```
