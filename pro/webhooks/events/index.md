# Events & Payloads

Reference for all webhook events and their payload structures.

[[toc]]

## Events Overview

Webhooks can be triggered by various Cockpit events. Use specific events for better performance.

## Content Events

| Event | Description |
|-------|-------------|
| `content.item.save` | Any content item is saved |
| `content.item.save.{model}` | Item in specific model is saved |
| `content.item.publish` | Content item is published |
| `content.item.unpublish` | Content item is unpublished |
| `content.item.remove` | Content item is deleted |
| `content.item.remove.{model}` | Item in specific model is deleted |

### Model-Specific Events

Use model-specific events for better filtering:

```
content.item.save.posts       # Only posts
content.item.save.products    # Only products
content.item.remove.pages     # Only when pages deleted
```

## Pages Events

| Event | Description |
|-------|-------------|
| `pages.page.save` | A page is saved |
| `pages.page.remove` | A page is deleted |

## Assets Events

| Event | Description |
|-------|-------------|
| `assets.asset.save` | An asset is saved |
| `assets.asset.remove` | An asset is deleted |

## Lokalize Events

| Event | Description |
|-------|-------------|
| `lokalize.project.save` | Translation project is saved |

## System Events

| Event | Description |
|-------|-------------|
| `system.user.save` | A user is saved |
| `system.user.remove` | A user is deleted |

## Payload Structures

When using the default payload (event data), the webhook receives the full event arguments.

### Content Save Payload

```json
[
  "posts",
  {
    "_id": "abc123",
    "_model": "posts",
    "_created": 1699999999,
    "_modified": 1700000000,
    "title": "My Blog Post",
    "content": "Hello world...",
    "_state": 1
  },
  false
]
```

The array contains:
1. Model name
2. Item data (full document)
3. Boolean indicating if item is new (`true` = create, `false` = update)

### Content State Values

| `_state` Value | Meaning |
|----------------|---------|
| `0` | Draft |
| `1` | Published |
| `-1` | Unpublished |

### Content Delete Payload

```json
[
  "posts",
  "abc123"
]
```

Array contains:
1. Model name
2. Deleted item ID

### Pages Save Payload

```json
[
  {
    "_id": "page123",
    "title": "About Us",
    "slug": "about",
    "route": "/about",
    "layout": [...]
  }
]
```

### Asset Save Payload

```json
[
  {
    "_id": "asset123",
    "title": "Hero Image",
    "path": "/storage/uploads/hero.jpg",
    "mime": "image/jpeg",
    "size": 245000,
    "_created": 1699999999
  }
]
```

### User Save Payload

```json
[
  {
    "_id": "user123",
    "user": "john",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin",
    "_created": 1699999999
  }
]
```

:::warning
User payloads do not include password hashes for security.
:::

## Custom Payloads

Define custom payload structures for your integrations.

### Slack Format

```json
{
  "text": "Content updated in Cockpit CMS",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New content published*\nA content item was just updated."
      }
    }
  ]
}
```

### Discord Format

```json
{
  "content": "Content updated in CMS",
  "embeds": [{
    "title": "Content Update",
    "description": "New content was just published",
    "color": 5814783
  }]
}
```

### Empty Payload

For services like Netlify that only need a trigger:

```json
{}
```

### Custom Variables

Use placeholders in custom payloads:

```json
{
  "action": "content_updated",
  "timestamp": "${DATE}",
  "source": "cockpit"
}
```

## Event Filtering Tips

### Listen to All Content Changes

```
content.item.save
content.item.remove
```

### Listen to Specific Model

```
content.item.save.posts
content.item.remove.posts
```

### Listen to Publications Only

```
content.item.publish
```

### Combined Events

Select multiple events in the webhook configuration to trigger on any of them.
