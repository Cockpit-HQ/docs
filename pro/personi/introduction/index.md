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

## Use Cases

Personi shines in scenarios where you need to show different content to different users:

### A/B Testing
Test different headlines, CTAs, or layouts to optimize conversion:
```json
{
  "personi:variants": [
    { "label": "Control", "audience": ["test-a"], "data": { "headline": "Start your free trial" } },
    { "label": "Variant B", "audience": ["test-b"], "data": { "headline": "Join 10,000+ happy customers" } }
  ]
}
```
Randomly assign users to `test-a` or `test-b` on the frontend and track which converts better.

### Member vs Guest Content
Show personalized content to logged-in users:
```
Guest: "Sign up to access exclusive content"
Member: "Welcome back, here's what's new"
Premium: "Your premium dashboard"
```

### Geo-Targeted Promotions
Display region-specific pricing or offers:
```json
{
  "personi:variants": [
    { "audience": ["region-eu"], "data": { "price": "€49", "currency": "EUR" } },
    { "audience": ["region-us"], "data": { "price": "$59", "currency": "USD" } },
    { "audience": [], "data": { "price": "$59", "currency": "USD" } }
  ]
}
```

### Device-Specific Layouts
Optimize layouts for mobile vs desktop:
```
?personi=mobile   → Simplified single-column layout
?personi=desktop  → Full multi-column layout with sidebar
```

## Installation

Copy the addon into `addons/Personi/` and ensure Cockpit loads addons (default behavior). No extra configuration required.

## Quick Start

**1. Add a variants field to your content model:**

In your collection or singleton, add a field with type `variants` and configure the inner fields.

**2. Create variants in the admin:**

Add multiple variants with different audience tags (e.g., `guest`, `member`, `premium`).

**3. Fetch personalized content:**

```bash
# Without personalization - returns raw variant structure
curl "https://your-site.com/api/content/item/homepage"

# With personalization - returns resolved content for members
curl "https://your-site.com/api/content/item/homepage?personi=member"
```

**4. That's it!** The API response now contains the resolved variant data instead of the raw structure.

## Best Practices

### Audience Tag Naming
- Use lowercase, hyphenated tags: `premium-member`, `region-eu`
- Be consistent across your application
- Document your tags for team reference

### Default Variants
- Always include a variant with empty `audience: []` as fallback
- Place the default variant first in the list

### Performance
- Personalization adds minimal overhead (in-memory processing)
- For heavy personalization, consider caching resolved content per audience combination

### Testing
- Test each variant by passing different audience combinations
- Use the raw API (without `personi`) to inspect all variants
- Verify schedule-based variants by testing with different `tz_offset` values

## Notes and Limitations

- Resolution only happens when the `personi` query parameter is present
- Audience tags are matched as provided; normalize consistently on the client
- If multiple variants tie with the same similarity, the first encountered wins
- The addon hooks into `content.api.items`, `content.api.item`, and `pages.api.page` events
- Variable replacement only works on string values, not keys or nested structures
