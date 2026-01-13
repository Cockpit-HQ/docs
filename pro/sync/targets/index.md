# Sync Targets & Resources

Configure sync destinations and understand what can be synchronized.

[[toc]]

## Setting Up Sync Targets

Navigate to **Settings > Sync** to manage sync targets.

### Creating a Target

1. Click **Add Target**
2. Configure the target:

| Field | Description |
|-------|-------------|
| **Name** | Descriptive name (e.g., "Production Server") |
| **URL** | Full URL to the target Cockpit instance |
| **Sync Key** | The sync key configured on the target server |
| **Push** | Enable to allow pushing data to this target |
| **Pull** | Enable to allow pulling data from this target |

### Example Target Configuration

```
Name: Production
URL: https://cms.example.com
Sync Key: a1b2c3d4e5f6g7h8i9j0...
Push: ✓ Enabled
Pull: ✓ Enabled
```

### Multiple Targets

Configure multiple targets for different purposes:

| Target Name | Purpose |
|-------------|---------|
| Production | Live website |
| Staging | Content preview |
| Backup | Disaster recovery |
| Development | Local testing |

## Syncable Resources

### Content

Synchronize your content models and data:

| Resource | Description |
|----------|-------------|
| **Locales** | System locale definitions |
| **Models** | Content model schemas (collections, singletons, trees) |
| **Data** | Actual content items |

**Options:**
- **Mirror** - Replace all target data (destructive)
- **Merge** - Only update existing and add new items

### Assets

Synchronize your media library:

| Resource | Description |
|----------|-------------|
| **Folders** | Asset folder structure |
| **Files** | Asset metadata and files |

Assets are transferred via HTTP, so both servers must be able to communicate.

:::tip
Ensure upload directories are accessible between servers. Large files may need increased timeout settings.
:::

### Pages

Synchronize the Pages addon:

| Resource | Description |
|----------|-------------|
| **Pages** | All page content and layouts |
| **Menus** | Navigation menu structures |
| **Settings** | Pages addon settings |

### Lokalize

Synchronize translation projects:

| Resource | Description |
|----------|-------------|
| **Projects** | Translation project definitions |
| **Keys** | Translation keys |
| **Values** | Translated strings |

**Sync Modes:**
- **Override** - Replace all translations
- **Missing Keys Only** - Only add missing keys, preserve existing

### Layout Components

Synchronize custom layout component definitions.

## Target Security

### Key Management

Each environment should have its own unique sync key:

```php
// Production - /config/config.php
return [
    'sync' => [
        'syncKey' => $_ENV['PROD_SYNC_KEY'] // 40+ character key
    ]
];

// Staging - /config/config.php
return [
    'sync' => [
        'syncKey' => $_ENV['STAGING_SYNC_KEY'] // Different key
    ]
];
```

### Network Security

- Only allow sync over HTTPS
- Consider IP whitelisting in firewall rules
- Use VPN for sensitive environments

### Permission Control

Restrict who can configure and run syncs:

```php
// Only administrators should have sync access
'permissions' => [
    'sync/manage' => true  // Full sync access
]
```

## Verifying Target Connection

Test connectivity before running a sync:

```bash
# Test from command line
curl -X POST https://target-server/api/sync/check \
  -H "Content-Type: application/json" \
  -d '{"syncKey": "your-sync-key"}'
```

Expected response:
```json
{
  "success": true,
  "version": "2.x.x"
}
```
