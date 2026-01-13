# Sync Operations

Run syncs, understand push vs pull, and configure sync options.

[[toc]]

## Running a Sync

### Full Sync

1. Go to **Settings > Sync**
2. Select a sync target
3. Choose **Push** or **Pull**
4. Select resources to sync
5. Click **Run Sync**

### Understanding Push vs Pull

**Push** - Send local data TO the target server:
```
[This Server] --data--> [Target Server]
```
Use push when you want to deploy local changes to another server.

**Pull** - Retrieve data FROM the target server:
```
[This Server] <--data-- [Target Server]
```
Use pull when you want to receive updates from another server.

### Individual Item Sync

Sync single content items or pages without a full sync:

1. Open the content item or page
2. Look for the **Sync** option in the sidebar
3. Select a target and sync direction
4. Optionally include linked assets
5. Click **Sync**

This is useful for publishing individual pieces of content.

## Sync Options

### Content Sync Options

| Option | Description |
|--------|-------------|
| **Sync All** | Synchronize all models and data |
| **Locales** | Include locale definitions |
| **Models** | Select specific models to sync |
| **Data** | Select specific content to sync |
| **Mirror** | Replace target data (full reset) |

### Mirror vs Merge

**Mirror Mode:**
- Completely replaces target data with source
- Deletes items that don't exist in source
- Use for clean deployments

**Merge Mode (Default):**
- Updates existing items
- Adds new items
- Preserves items not in source
- Safer for incremental updates

### Lokalize Sync Options

| Option | Description |
|--------|-------------|
| **Projects** | Select specific translation projects |
| **Override** | Replace all translations |
| **Missing Keys Only** | Only add new keys, preserve existing |

### Pages Sync Options

| Option | Description |
|--------|-------------|
| **Pages** | Sync page content |
| **Menus** | Sync menu structures |
| **Settings** | Sync Pages addon settings |

### Asset Sync Options

| Option | Description |
|--------|-------------|
| **Folders** | Sync folder structure |
| **Files** | Transfer file metadata and binary data |
| **Exclude Large Files** | Skip files over size threshold |

## Sync Progress

During sync operations, you'll see:

- **Current task** - What's being synced
- **Progress bar** - Completion percentage
- **Item counts** - Number of items processed
- **Errors** - Any issues encountered

## Selective Sync Strategies

### By Model

Only sync specific content models:

```
☑ blog_posts
☑ authors
☐ categories    (excluded)
☐ settings      (excluded)
```

### By Content State

Sync only published content:

```php
// In automation script
$jobs = [
    [
        'name' => 'content',
        'syncSettings' => [
            'models' => ['posts'],
            'filter' => ['_state' => 1]  // Only published
        ]
    ]
];
```

### By Date

Sync recently modified content:

```php
$lastSync = strtotime('-24 hours');

$jobs = [
    [
        'name' => 'content',
        'syncSettings' => [
            'filter' => ['_modified' => ['$gte' => $lastSync]]
        ]
    ]
];
```

## Handling Conflicts

### ID-Based Matching

Sync uses document `_id` fields to match records:

- Same ID = Update existing record
- New ID = Create new record
- Missing ID (in mirror mode) = Delete record

### Timestamps

After sync, `_modified` timestamps are updated on the target.

### Resolution Strategies

1. **Source wins** - Default behavior, source data overwrites target
2. **Target wins** - Use "Missing Keys Only" for Lokalize
3. **Manual** - Review before sync, use selective options

## Common Sync Scenarios

### Deploy New Content Model

1. Create model on staging
2. Add sample content
3. Test thoroughly
4. Push model schema to production
5. Content team creates production content

### Update Existing Content

1. Editor modifies content on staging
2. Content approved
3. Individual item sync to production
4. Content is live

### Sync Media Library

1. Upload assets on staging
2. Push assets to production
3. Assets available with same IDs
4. Content references remain valid

### Pull Production Data

1. Select production target
2. Choose "Pull"
3. Select content models
4. Local data updated from production
5. Test with real data
