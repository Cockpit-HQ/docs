# API Reference

Complete API reference for Personi personalization, including request parameters, headers, and response formats.

[[toc]]

## Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `personi` | string | Comma-separated audience tags |
| `tz_offset` | string/int | Client timezone offset for scheduling |
| `personi_vars` | object | Variables for placeholder replacement |

## Request Headers

| Header | Description |
|--------|-------------|
| `X-Personi-Audience` | Alternative to `personi` query param |
| `X-Personi-TZ-Offset` | Alternative to `tz_offset` query param |
| `X-Personi-Vars` | JSON object of variables |

## Example Requests

### Basic Personalization

```bash
curl -X GET "https://your-site.com/api/content/item/homepage?personi=member" \
  -H "api-key: your-api-key"
```

### Multiple Audiences

```bash
curl -X GET "https://your-site.com/api/content/item/homepage?personi=member,premium" \
  -H "api-key: your-api-key"
```

### With Variables

```bash
curl -X GET "https://your-site.com/api/content/item/homepage?personi=member&personi_vars[name]=John" \
  -H "api-key: your-api-key"
```

### Using Headers

```bash
curl -X GET "https://your-site.com/api/content/item/homepage" \
  -H "api-key: your-api-key" \
  -H "X-Personi-Audience: member,premium" \
  -H "X-Personi-TZ-Offset: +02:00" \
  -H "X-Personi-Vars: {\"name\":\"John\"}"
```

## Response Format

### Without `personi` Parameter

Returns raw variant structure:

```json
{
  "hero": {
    "personi:variants": [
      { "id": "v1", "active": true, "label": "Guest", "audience": [], "data": { "title": "Welcome" } },
      { "id": "v2", "active": true, "label": "Member", "audience": ["member"], "data": { "title": "Welcome back" } }
    ]
  }
}
```

### With `?personi=member`

Returns resolved content:

```json
{
  "hero": {
    "title": "Welcome back"
  }
}
```

:::info Note
Resolution only happens when the `personi` query parameter or header is present. Without it, APIs return the raw variant structure.
:::

## Variable Replacement

Use placeholders in your content that get replaced at request time.

### Syntax

| Pattern | Description |
|---------|-------------|
| `{{ name }}` | Simple variable |
| `{{ user.city }}` | Nested with dot notation |
| `{{ name:Guest }}` | With default value |

### Passing Variables

**Query parameter (simple):**
```
?personi_vars[name]=Artur
```

**Query parameter (JSON):**
```
?personi_vars={"name":"Artur","user":{"city":"Berlin"}}
```

**Header:**
```
X-Personi-Vars: {"name":"Artur"}
```

### Example

**Content:** `"Hello {{ name:Guest }}, welcome to {{ city:our site }}!"`

**Request:** `?personi=member&personi_vars[name]=Sarah&personi_vars[city]=London`

**Result:** `"Hello Sarah, welcome to London!"`

## Programmatic Use

Resolve variants in custom PHP code using the helper:

```php
// Basic usage
$audience = ['member', 'premium'];
$data = $app->helper('personi')->process($data, $audience);

// With timezone offset
$ctx = ['tzoffset' => 120]; // minutes from UTC
$data = $app->helper('personi')->process($data, $audience, $ctx);

// With variable replacement
$ctx = ['variables' => ['name' => 'Artur', 'company' => 'Acme']];
$data = $app->helper('personi')->process($data, $audience, $ctx);

// Combined
$ctx = [
    'tzoffset' => 120,
    'variables' => ['name' => 'Artur']
];
$data = $app->helper('personi')->process($data, $audience, $ctx);
```

## Troubleshooting

### Variables not replaced?
1. Check syntax: `{{ name }}` with spaces inside braces
2. Verify `personi_vars` is properly formatted
3. Default values use colon: `{{ name:Default }}`

### Response still shows raw variants?
1. Ensure `personi` parameter is included in the request
2. Check that the parameter value is not empty
3. Verify headers are properly formatted if using header-based approach
