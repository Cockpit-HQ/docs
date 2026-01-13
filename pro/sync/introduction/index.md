# Sync

Synchronize data between multiple Cockpit instances for staging, production, and distributed environments.

[[toc]]

## Overview

The Sync addon enables seamless data synchronization between multiple Cockpit instances. Keep staging and production environments in sync, distribute content across teams, or maintain consistent data across distributed installations.

## Features

- **Bi-directional sync** - Push or pull data between instances
- **Selective sync** - Choose exactly what to synchronize
- **Multiple targets** - Configure multiple sync destinations
- **All resource types** - Sync content, assets, pages, translations, and layouts
- **Individual item sync** - Sync single items without full sync
- **Mirror mode** - Option to mirror (replace) or merge data
- **Secure transfer** - JWT-signed payloads for secure communication
- **Async execution** - Non-blocking sync operations
- **Progress logging** - Real-time sync progress tracking

## Use Cases

### Staging to Production

Push content from a staging environment to production after review:

```
[Staging Server] --push--> [Production Server]
```

### Content Team Distribution

Keep multiple content editors synchronized:

```
[Central Hub] <--pull/push--> [Editor A]
              <--pull/push--> [Editor B]
```

### Development Workflow

Pull production data to local development for testing:

```
[Development] <--pull-- [Production]
```

### Multi-Region Deployment

Distribute content across regional servers:

```
[Master] --push--> [US Region]
         --push--> [EU Region]
         --push--> [Asia Region]
```

## Configuration

### Sync Key

Each Cockpit instance needs a unique sync key. Define it in `/config/config.php`:

```php
<?php

return [
    'sync' => [
        'syncKey' => 'your-secure-sync-key-here'
    ]
];
```

:::warning Security
- Use a strong, unique key (at least 20 characters)
- Never share sync keys publicly
- Use different keys for different environments
- Rotate keys periodically for security
:::

### Generating a Secure Key

Generate a secure key with PHP:

```bash
php -r "echo bin2hex(random_bytes(20));"
```

Or use OpenSSL:

```bash
openssl rand -hex 20
```

### Using Environment Variables

For better security in production:

```php
<?php

return [
    'sync' => [
        'syncKey' => $_ENV['COCKPIT_SYNC_KEY']
    ]
];
```

## Best Practices

### Security

- Use strong, unique sync keys per environment
- Restrict sync permissions to administrators only
- Use HTTPS for all sync transfers
- Consider IP whitelisting for sync endpoints

### Data Integrity

- Always test sync on staging first
- Use "Missing Keys Only" for translations to avoid overwrites
- Avoid mirror mode unless you intend to fully replace data
- Back up before major sync operations

### Performance

- Schedule large syncs during low-traffic periods
- Use selective sync instead of "Sync All" when possible
- Consider sync batching for very large datasets
