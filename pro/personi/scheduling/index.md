# Scheduling Variants

Control when variants are active using time-based scheduling. Perfect for campaigns, promotions, and time-sensitive content.

[[toc]]

## Overview

Use `meta.schedule` inside a variant to control when it is active. Scheduled variants are only considered for matching during their active time window.

```json
{
  "label": "Black Friday",
  "audience": [],
  "data": { "banner": "50% OFF Everything!" },
  "meta": {
    "schedule": {
      "start": "2025-11-29T00:00:00",
      "end": "2025-11-29T23:59:59",
      "timezone": "America/New_York"
    }
  }
}
```

## Schedule Configuration

All keys are optional - use only what you need:

| Key | Description |
|-----|-------------|
| `start` | DateTime string (ISO 8601 recommended) |
| `end` | DateTime string (ISO 8601 recommended) |
| `timezone` or `tz` | PHP timezone identifier (e.g., `Europe/Berlin`) |
| `days` | Allowed days; numbers `0..6` where `0=Sun` or names `sun..sat` |
| `times` | One or more time windows for the day |

## Time Windows

Time windows can be specified as:

**String format:**
```json
"times": ["09:00-17:30"]
```

**Object format:**
```json
"times": [{ "from": "09:00", "to": "17:30" }]
```

**Multiple windows:**
```json
"times": ["09:00-12:00", "14:00-18:00"]
```

**Overnight spans:**
```json
"times": ["22:00-02:00"]
```

## Examples

### Weekday Business Hours

Show a "Contact us" variant only during business hours:

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

### Weekend Happy Hour

Special promotion during weekend afternoons:

```json
{
  "meta": {
    "schedule": {
      "days": ["sat", "sun"],
      "times": ["16:00-19:00"]
    }
  }
}
```

### Holiday Campaign

Black Friday through Cyber Monday:

```json
{
  "meta": {
    "schedule": {
      "start": "2025-11-28T00:00:00",
      "end": "2025-12-01T23:59:59",
      "timezone": "America/New_York"
    }
  }
}
```

### Lunch Menu

Show lunch specials only during lunch hours:

```json
{
  "meta": {
    "schedule": {
      "days": [1, 2, 3, 4, 5],
      "times": ["11:30-14:00"]
    }
  }
}
```

## Client Timezone Offset

API clients can pass their timezone offset to have scheduling evaluated correctly for the user's local time.

### Query Parameter

```
?tz_offset=120
?tz_offset=+02:00
```

### Header

```
X-Personi-TZ-Offset: +02:00
```

The offset accepts either:
- An integer (minutes from UTC, e.g., `120` for UTC+2)
- A string in the form `±HH:MM` (e.g., `+02:00`)

### JavaScript Example

```javascript
// Get user's timezone offset in minutes
const tzOffset = new Date().getTimezoneOffset() * -1;

// Include in API request
const response = await fetch(
  `/api/content/item/homepage?personi=member&tz_offset=${tzOffset}`
);
```

:::warning Caching
If you use `tz_offset` in public APIs, consider disabling caching or adding cache vary rules for such requests. Different timezone offsets will result in different content being served.
:::

## Combining Schedules with Audiences

You can combine scheduling with audience targeting:

```json
{
  "personi:variants": [
    {
      "label": "Premium Black Friday",
      "audience": ["premium"],
      "data": { "discount": "60%" },
      "meta": {
        "schedule": {
          "start": "2025-11-29T00:00:00",
          "end": "2025-11-29T23:59:59"
        }
      }
    },
    {
      "label": "Regular Black Friday",
      "audience": [],
      "data": { "discount": "40%" },
      "meta": {
        "schedule": {
          "start": "2025-11-29T00:00:00",
          "end": "2025-11-29T23:59:59"
        }
      }
    },
    {
      "label": "Default",
      "audience": [],
      "data": { "discount": null }
    }
  ]
}
```

In this example, premium members get 60% off during Black Friday, regular visitors get 40% off, and outside of Black Friday everyone sees no discount.
