# Personi

Personi is an audience-based content and layout personalization addon for Cockpit CMS. It lets you define multiple content or layout variants and automatically resolves the best matching variant at API time based on the requested audience.

Editors author variants visually in the admin; frontend clients select the audience via a simple query parameter.

[[toc]]

## Features

- **Variants field type** for any model - create multiple variants with label, active state, audience tags, and optional meta
- **Schedule-based activation** - activate variants only within specific date/time windows
- **Layout Variants component** - personalize entire sections in Layout pages
- **API-level resolution** - pass audience tags to APIs and receive resolved content
- **Smart matching** - uses Jaccard similarity on audience tags with fallback to first active variant
- **Variable replacement** - use placeholders like `{{ name }}` and replace them via request variables
- **Non-destructive** - stored data remains unchanged; resolution only transforms the API output

## Installation

Copy the addon into `addons/Personi/` and ensure Cockpit loads addons (default behavior). No extra configuration required.

## Adding a Variants Field

When defining a collection or singleton field, choose type `variants` and configure the inner fields that make up each variant's `data`:

- Field type: `variants`
- Option: `fields` → add any fields (e.g., `heading`, `image`, `cta`)

Your stored value will look like:

```json
{
  "personi:variants": [
    {
      "id": "auto-generated",
      "active": true,
      "label": "Default",
      "data": { "heading": "Welcome" },
      "meta": null,
      "audience": []
    },
    {
      "id": "auto-generated",
      "active": true,
      "label": "Members",
      "data": { "heading": "Welcome back" },
      "meta": null,
      "audience": ["member"]
    }
  ]
}
```

The `variants` field provides:

- Add, remove, and reorder variants
- Toggle active state and set an optional label
- Audience tags editor
- Embedded fields renderer to define the variant data
- Optional meta object for additional notes or configuration

## Layout Variants

In Layout pages, add the component "Layout Variants". It contains a `layout` field of type `variants` so you can define audience-specific layouts. At API time, Personi unwraps the selected layout automatically.

## Requesting Personalized Content

Add the `personi` query parameter when calling Cockpit APIs:

```
GET /api/content/items/blog?token=YOUR_TOKEN&personi=member
GET /api/content/item/blog/ID?token=YOUR_TOKEN&personi=member,premium
GET /api/pages/page/HOME_ID?token=YOUR_TOKEN&personi=mobile
```

You can also use the HTTP header:

```
GET /api/content/items/blog?token=YOUR_TOKEN
X-Personi-Audience: member,premium
```

When `personi` is present, the response is processed and any `personi:variants` node is replaced with the best matching variant's `data`.

:::info Note
Resolution only happens when the `personi` query parameter or header is present. Without it, APIs return the raw variant structure.
:::

## How Matching Works

1. Filters out inactive variants
2. Computes similarity between the request audience (tags you pass) and each variant's `audience` using Jaccard similarity: `|intersection| / |union|`
3. Picks the variant with the highest similarity
4. If no variant has an audience or there's no better match, falls back to the first active variant

This resolution runs recursively across arrays, so nested structures are also handled.

## Scheduling Variants

Use `meta.schedule` inside a variant to control when it is active.

### Supported Keys

All keys are optional:

| Key | Description |
|-----|-------------|
| `start` | DateTime string (ISO 8601 recommended) |
| `end` | DateTime string (ISO 8601 recommended) |
| `timezone` or `tz` | PHP timezone identifier (e.g., `Europe/Berlin`) |
| `days` | Allowed days; numbers `0..6` where `0=Sun` or names `sun..sat`/`sunday..saturday` |
| `times` | One or more time windows for the day |

### Time Windows

Time windows can be specified as:

- String: `"HH:MM-HH:MM"` (supports overnight, e.g., `"22:00-02:00"`)
- Object: `{ "from": "HH:MM", "to": "HH:MM" }`

### Example: Weekday Business Hours

```json
{
  "meta": {
    "schedule": {
      "start": "2025-11-01T00:00:00",
      "end": "2025-11-30T23:59:59",
      "timezone": "Europe/Berlin",
      "days": ["mon", "tue", "wed", "thu", "fri"],
      "times": ["09:00-17:30"]
    }
  }
}
```

### Shorthand

You can also use a flattened format directly on meta:

```json
{
  "meta": {
    "start": "2025-11-01T00:00:00",
    "end": "2025-11-30T23:59:59"
  }
}
```

## Client Timezone Offset

API clients can pass their timezone offset to have scheduling evaluated correctly for the user's local time.

**Query parameter:**
```
?tz_offset=120
?tz_offset=+02:00
```

**Header:**
```
X-Personi-TZ-Offset: +02:00
```

The offset accepts either an integer (minutes) or a string in the form `±HH:MM`. When provided, Personi derives the client-local "now" by adding the offset to UTC and evaluates day/time windows against that local time.

:::warning Caching
If you use `tz_offset` in public APIs, consider disabling caching or adding cache vary rules for such requests.
:::

## Variable Replacement

You can use placeholders in your content that will be replaced by values provided in the request.

### Syntax

- Basic: `{{ name }}`
- Nested: `{{ user.location.city }}` (supports dot notation)
- With default: `{{ name:Guest }}`

### Passing Variables

**Query parameter:**
```
?personi_vars[name]=Artur
?personi_vars={"name":"Artur"}
```

**Header:**
```
X-Personi-Vars: {"name":"Artur"}
```

### Example

If you have variant data `{"title": "Hello {{ name }}"}` and request with `?personi_vars[name]=Artur`, the response will be:

```json
{"title": "Hello Artur"}
```

## Programmatic Use

You can resolve arrays programmatically in custom code using the helper:

```php
// $app is the Cockpit/Lime app instance
$audience = ['member', 'premium'];
$data = $app->helper('personi')->process($data, $audience);

// With client time offset context
$ctx = ['tzoffset' => 120]; // minutes relative to UTC
$data = $app->helper('personi')->process($data, $audience, $ctx);

// With variable replacement
$ctx = ['variables' => ['name' => 'Artur']];
$data = $app->helper('personi')->process($data, $audience, $ctx);
```

## Notes and Limitations

- Resolution only happens when the `personi` query parameter is present
- Audience tags are matched as provided; normalize consistently on the client (e.g., lowercase)
- If multiple variants tie with the same similarity, the first encountered wins
- The addon hooks into `content.api.items`, `content.api.item`, and `pages.api.page` events
