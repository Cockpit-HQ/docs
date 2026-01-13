# Automation & CI/CD

Automate sync operations with scripts, CI/CD pipelines, and webhooks.

[[toc]]

## Command Line Sync

Create a PHP script for automated sync:

```php
#!/usr/bin/env php
<?php
// sync-to-production.php

include 'index.php';

$target = [
    'uri' => 'https://production.example.com',
    'mode' => 'push',
    'syncKey' => getenv('PRODUCTION_SYNC_KEY')
];

$jobs = [
    ['name' => 'content', 'syncSettings' => ['syncAll' => true]],
    ['name' => 'assets', 'syncSettings' => []],
];

try {
    Cockpit()->helper('sync')->run($target, $jobs);
    echo "Sync completed successfully\n";
} catch (Exception $e) {
    echo "Sync failed: " . $e->getMessage() . "\n";
    exit(1);
}
```

Run with:
```bash
php sync-to-production.php
```

## GitHub Actions Integration

```yaml
# .github/workflows/deploy-content.yml
name: Deploy Content to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'

      - name: Install dependencies
        run: composer install --no-dev

      - name: Run sync to production
        env:
          PRODUCTION_SYNC_KEY: ${{ secrets.PRODUCTION_SYNC_KEY }}
        run: php sync-to-production.php
```

### Scheduled Sync

```yaml
name: Scheduled Content Sync

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-dev
      - env:
          PRODUCTION_SYNC_KEY: ${{ secrets.PRODUCTION_SYNC_KEY }}
        run: php sync-to-production.php
```

## GitLab CI/CD Integration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy

deploy-content:
  stage: deploy
  image: php:8.2-cli
  script:
    - composer install --no-dev
    - php sync-to-production.php
  environment:
    name: production
  only:
    - main
  variables:
    PRODUCTION_SYNC_KEY: $PRODUCTION_SYNC_KEY
```

## Webhook-Triggered Sync

Combine with the Webhooks addon for automated publishing:

```php
// /config/bootstrap.php
$app->on('content.item.publish', function($model, $item) use ($app) {

    // Auto-sync published items to production
    $target = [
        'uri' => getenv('PRODUCTION_URL'),
        'mode' => 'push',
        'syncKey' => getenv('PRODUCTION_SYNC_KEY')
    ];

    $app->helper('sync')->syncItem('content', $target, [
        'model' => $model,
        'item' => $item,
        'syncAssets' => true
    ]);
});
```

## Workflows

### Content Publishing Workflow

```
1. [Author] Creates content on Staging
2. [Editor] Reviews and approves
3. [Admin] Pushes to Production
4. [Production] Content is live
```

### Multi-Environment Setup

```
Development → Staging → Production

1. Develop and test on Development
2. Push content models to Staging
3. Content team works on Staging
4. Push approved content to Production
```

### Disaster Recovery

Regular backups via sync:

```php
// backup-content.php
$targets = [
    [
        'uri' => 'https://backup1.example.com',
        'mode' => 'push',
        'syncKey' => getenv('BACKUP1_KEY')
    ],
    [
        'uri' => 'https://backup2.example.com',
        'mode' => 'push',
        'syncKey' => getenv('BACKUP2_KEY')
    ]
];

foreach ($targets as $target) {
    Cockpit()->helper('sync')->run($target, [
        ['name' => 'content', 'syncSettings' => ['syncAll' => true]],
        ['name' => 'assets', 'syncSettings' => []],
        ['name' => 'pages', 'syncSettings' => ['syncAll' => true]],
    ]);
}
```

## Sync Scripts Library

### Selective Model Sync

```php
<?php
// sync-posts.php

include 'index.php';

$target = [
    'uri' => getenv('PRODUCTION_URL'),
    'mode' => 'push',
    'syncKey' => getenv('PRODUCTION_SYNC_KEY')
];

$jobs = [
    [
        'name' => 'content',
        'syncSettings' => [
            'models' => ['posts', 'authors', 'categories'],
            'mirror' => false
        ]
    ]
];

Cockpit()->helper('sync')->run($target, $jobs);
```

### Pull Production for Development

```php
<?php
// pull-from-production.php

include 'index.php';

$target = [
    'uri' => getenv('PRODUCTION_URL'),
    'mode' => 'pull',
    'syncKey' => getenv('PRODUCTION_SYNC_KEY')
];

$jobs = [
    ['name' => 'content', 'syncSettings' => ['syncAll' => true]],
    ['name' => 'assets', 'syncSettings' => []],
];

Cockpit()->helper('sync')->run($target, $jobs);

echo "Local environment updated with production data\n";
```

### Translations Sync

```php
<?php
// sync-translations.php

include 'index.php';

$target = [
    'uri' => getenv('PRODUCTION_URL'),
    'mode' => 'push',
    'syncKey' => getenv('PRODUCTION_SYNC_KEY')
];

$jobs = [
    [
        'name' => 'lokalize',
        'syncSettings' => [
            'projects' => ['website', 'app'],
            'missingKeysOnly' => true  // Don't overwrite existing
        ]
    ]
];

Cockpit()->helper('sync')->run($target, $jobs);
```

## Environment Configuration

### Development

```php
// config/config.php
return [
    'sync' => [
        'syncKey' => 'dev-key-for-local-testing'
    ]
];
```

### Staging

```php
// config/config.php
return [
    'sync' => [
        'syncKey' => $_ENV['STAGING_SYNC_KEY']
    ]
];
```

### Production

```php
// config/config.php
return [
    'sync' => [
        'syncKey' => $_ENV['PRODUCTION_SYNC_KEY']
    ]
];
```

## Sync Notifications

Send notifications after sync completes:

```php
<?php
// sync-with-notification.php

include 'index.php';

$target = [
    'uri' => getenv('PRODUCTION_URL'),
    'mode' => 'push',
    'syncKey' => getenv('PRODUCTION_SYNC_KEY')
];

$jobs = [
    ['name' => 'content', 'syncSettings' => ['syncAll' => true]]
];

try {
    Cockpit()->helper('sync')->run($target, $jobs);

    // Notify Slack
    file_get_contents(getenv('SLACK_WEBHOOK'), false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'text' => '✅ Content sync to production completed successfully'
            ])
        ]
    ]));

} catch (Exception $e) {
    // Notify on failure
    file_get_contents(getenv('SLACK_WEBHOOK'), false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'text' => '❌ Content sync failed: ' . $e->getMessage()
            ])
        ]
    ]));

    exit(1);
}
```
