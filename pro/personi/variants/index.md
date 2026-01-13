# Variants Field

Learn how to add and configure the variants field type for audience-based content personalization.

[[toc]]

## Adding a Variants Field

When defining a collection or singleton field, choose type `variants` and configure the inner fields that make up each variant's `data`:

- Field type: `variants`
- Option: `fields` → add any fields (e.g., `heading`, `image`, `cta`)

Your stored value will look like:

```json
{
  "personi:variants": [
    {
      "id": "v-abc123",
      "active": true,
      "label": "Default",
      "data": { "heading": "Welcome" },
      "meta": null,
      "audience": []
    },
    {
      "id": "v-def456",
      "active": true,
      "label": "Members",
      "data": { "heading": "Welcome back" },
      "meta": null,
      "audience": ["member"]
    }
  ]
}
```

## Field Capabilities

The `variants` field provides:

- Add, remove, and reorder variants
- Toggle active state and set an optional label
- Audience tags editor
- Embedded fields renderer to define the variant data
- Optional meta object for additional notes or configuration

## Variant Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier (auto-generated) |
| `active` | boolean | Whether this variant is considered for matching |
| `label` | string | Display name in admin UI |
| `data` | object | The actual content fields |
| `meta` | object | Optional metadata (e.g., scheduling) |
| `audience` | array | Audience tags for matching |

## Layout Variants

In Layout pages, add the component "Layout Variants". It contains a `layout` field of type `variants` so you can define audience-specific layouts. At API time, Personi unwraps the selected layout automatically.

This allows you to create entirely different page layouts for different audiences - for example, a simplified mobile layout vs. a feature-rich desktop layout.

## How Matching Works

When a request includes the `personi` parameter, Personi resolves variants using this algorithm:

1. Filters out inactive variants (`active: false`)
2. Filters out variants outside their schedule window
3. Computes Jaccard similarity: `|intersection| / |union|`
4. Picks the variant with the highest similarity score
5. Falls back to the first active variant if no audience matches

### Jaccard Similarity Example

**Request audience:** `["member", "premium"]`

| Variant | Audience | Calculation | Score |
|---------|----------|-------------|-------|
| A | `["member"]` | 1 / 2 | 0.5 |
| B | `["member", "premium"]` | 2 / 2 | 1.0 |
| C | `["guest"]` | 0 / 3 | 0 |

**Result:** Variant B wins with the highest score (1.0)

### Tie Breaking

If multiple variants have the same similarity score, the first one in the list wins. This makes the order of variants significant - place your preferred fallback variants earlier in the list.

### Recursive Resolution

The resolution runs recursively across arrays, so nested structures containing variants are also handled automatically.

## Troubleshooting

### Variant not showing?
1. Check if the variant is `active: true`
2. Verify audience tags match exactly (case-sensitive)
3. Check schedule constraints if using `meta.schedule`
4. Ensure `personi` parameter is included in the request

### Wrong variant selected?
1. Remember: highest Jaccard similarity wins
2. Empty audience `[]` only matches when no better option exists
3. Multiple variants with same score → first one wins
