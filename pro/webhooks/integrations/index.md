# Integration Examples

Ready-to-use webhook configurations for popular services.

[[toc]]

## Static Site Deployment

### Netlify Deploy

Trigger a Netlify rebuild when content changes:

1. Get your build hook URL from Netlify (Site Settings > Build & Deploy > Build hooks)
2. Create webhook:
   - **URL:** `https://api.netlify.com/build_hooks/your-hook-id`
   - **Method:** POST
   - **Events:** `content.item.save`, `content.item.remove`
   - **Payload:** None required

:::tip
Store the hook URL in your `.env` file:
```
NETLIFY_BUILD_HOOK=https://api.netlify.com/build_hooks/your-hook-id
```
Then use `${NETLIFY_BUILD_HOOK}` as the webhook URL.
:::

### Vercel Deploy

Trigger Vercel deployments:

1. Get deploy hook from Vercel project settings
2. Create webhook:
   - **URL:** `https://api.vercel.com/v1/integrations/deploy/your-hook`
   - **Method:** POST
   - **Events:** `content.item.publish`

### Cloudflare Pages

1. Get deploy hook from Cloudflare Pages dashboard
2. Create webhook:
   - **URL:** `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/your-hook`
   - **Method:** POST
   - **Events:** `content.item.save`

### GitHub Actions

Trigger a workflow dispatch:

- **URL:** `https://api.github.com/repos/owner/repo/dispatches`
- **Method:** POST
- **Headers:**
  ```
  Authorization: Bearer ${GITHUB_TOKEN}
  Accept: application/vnd.github.v3+json
  ```
- **Payload:**
  ```json
  {
    "event_type": "content_updated",
    "client_payload": {}
  }
  ```

## Notifications

### Slack Notifications

Send notifications to Slack when content is published:

1. Create an Incoming Webhook in Slack
2. Create webhook:
   - **URL:** `${SLACK_WEBHOOK_URL}` (from .env)
   - **Method:** POST
   - **Events:** `content.item.publish`
   - **Payload:** Custom
   ```json
   {
     "text": "New content published!",
     "channel": "#content-updates",
     "username": "Cockpit CMS",
     "icon_emoji": ":rocket:"
   }
   ```

### Slack with Rich Formatting

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Content Published"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "A new content item was just published in Cockpit CMS."
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":clock1: Published just now"
        }
      ]
    }
  ]
}
```

### Discord Notifications

- **URL:** `${DISCORD_WEBHOOK_URL}`
- **Method:** POST
- **Payload:**
  ```json
  {
    "content": "Content updated in CMS",
    "embeds": [{
      "title": "Content Update",
      "description": "New content was just published",
      "color": 5814783,
      "footer": {
        "text": "Cockpit CMS"
      }
    }]
  }
  ```

### Microsoft Teams

- **URL:** `${TEAMS_WEBHOOK_URL}`
- **Method:** POST
- **Payload:**
  ```json
  {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "summary": "Content Update",
    "themeColor": "0076D7",
    "title": "Content Published",
    "sections": [{
      "activityTitle": "New content was published",
      "facts": [{
        "name": "Source",
        "value": "Cockpit CMS"
      }]
    }]
  }
  ```

## Search Indexing

### Algolia Search Index

Update search index when content changes:

- **URL:** `https://your-function.netlify.app/.netlify/functions/update-algolia`
- **Method:** POST
- **Events:** `content.item.save.posts`, `content.item.remove.posts`

Example serverless function to handle this:

```javascript
// netlify/functions/update-algolia.js
const algoliasearch = require('algoliasearch');

exports.handler = async (event) => {
  const payload = JSON.parse(event.body);
  const [model, item, isNew] = payload;

  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
  );
  const index = client.initIndex('posts');

  if (item._state === 1) { // Published
    await index.saveObject({
      objectID: item._id,
      title: item.title,
      content: item.content,
    });
  } else {
    await index.deleteObject(item._id);
  }

  return { statusCode: 200, body: 'OK' };
};
```

### Meilisearch

```javascript
// functions/update-meilisearch.js
const { MeiliSearch } = require('meilisearch');

exports.handler = async (event) => {
  const payload = JSON.parse(event.body);
  const [model, item] = payload;

  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_KEY
  });

  const index = client.index(model);

  if (item._state === 1) {
    await index.addDocuments([{ id: item._id, ...item }]);
  } else {
    await index.deleteDocument(item._id);
  }

  return { statusCode: 200, body: 'OK' };
};
```

## Custom API Integration

### Generic REST API

Sync content to external system:

- **URL:** `https://api.example.com/webhooks/cockpit`
- **Method:** POST
- **Headers:**
  ```
  Authorization: Bearer ${API_TOKEN}
  X-Webhook-Secret: ${WEBHOOK_SECRET}
  Content-Type: application/json
  ```
- **Payload:** Event data (default)

### Cache Invalidation

Purge CDN cache when content changes:

#### Cloudflare

- **URL:** `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`
- **Method:** POST
- **Headers:**
  ```
  Authorization: Bearer ${CF_API_TOKEN}
  ```
- **Payload:**
  ```json
  {
    "purge_everything": true
  }
  ```

#### Fastly

- **URL:** `https://api.fastly.com/service/${FASTLY_SERVICE_ID}/purge_all`
- **Method:** POST
- **Headers:**
  ```
  Fastly-Key: ${FASTLY_API_KEY}
  ```

### Analytics Events

Send events to analytics platforms:

#### Segment

- **URL:** `https://api.segment.io/v1/track`
- **Method:** POST
- **Headers:**
  ```
  Authorization: Basic ${SEGMENT_WRITE_KEY}
  ```
- **Payload:**
  ```json
  {
    "event": "Content Published",
    "properties": {
      "source": "cockpit"
    }
  }
  ```
