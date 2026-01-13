# Page Types

Define different page templates with custom fields and layouts.

[[toc]]

## Overview

Page Types allow you to create different templates for your pages. Instead of having one generic page structure, you can define specific page types like "Blog Post", "Landing Page", "Product Page", each with their own fields and layout options.

## Creating a Page Type

1. Navigate to **Pages > Page Types**
2. Click **Add Page Type**
3. Configure the page type:

| Field | Description |
|-------|-------------|
| **Name** | Identifier (lowercase, no spaces) |
| **Label** | Display name in the admin |
| **Fields** | Custom fields for this page type |
| **Layout Components** | Allowed layout components |

## Example Page Types

### Blog Post

```json
{
  "name": "blog-post",
  "label": "Blog Post",
  "fields": [
    { "name": "author", "type": "text", "label": "Author" },
    { "name": "published_date", "type": "date", "label": "Published Date" },
    { "name": "featured_image", "type": "asset", "label": "Featured Image" },
    { "name": "excerpt", "type": "textarea", "label": "Excerpt" },
    { "name": "categories", "type": "tags", "label": "Categories" }
  ]
}
```

### Landing Page

```json
{
  "name": "landing-page",
  "label": "Landing Page",
  "fields": [
    { "name": "hero_headline", "type": "text", "label": "Hero Headline" },
    { "name": "hero_image", "type": "asset", "label": "Hero Image" },
    { "name": "cta_text", "type": "text", "label": "CTA Button Text" },
    { "name": "cta_url", "type": "text", "label": "CTA Button URL" }
  ]
}
```

### Product Page

```json
{
  "name": "product-page",
  "label": "Product Page",
  "fields": [
    { "name": "price", "type": "number", "label": "Price" },
    { "name": "sku", "type": "text", "label": "SKU" },
    { "name": "gallery", "type": "asset", "label": "Product Gallery", "opts": { "multiple": true } },
    { "name": "specifications", "type": "repeater", "label": "Specifications" }
  ]
}
```

## Using Page Types

### Creating a Page with a Type

1. Go to **Pages**
2. Click **Add Page**
3. Select the page type from the dropdown
4. The form will show the standard page fields plus your custom fields

### Filtering by Page Type

In the API, filter pages by type:

```javascript
fetch('/api/pages/pages?filter={"type":"blog-post"}', {
  headers: { 'api-key': 'your-api-key' }
})
.then(res => res.json())
.then(pages => console.log(pages));
```

### Routes API with Types

The routes endpoint includes page types:

```javascript
fetch('/api/pages/routes', {
  headers: { 'api-key': 'your-api-key' }
})
.then(res => res.json())
.then(routes => {
  // routes include type information
  // { route: "/blog/my-post", slug: "my-post", type: "blog-post" }
});
```

## Page Type Response

When fetching a page, the response includes the type and custom fields:

```json
{
  "_id": "page123",
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "route": "/blog/my-blog-post",
  "type": "blog-post",
  "seo": {
    "title": "My Blog Post | Site Name",
    "description": "..."
  },
  "author": "John Doe",
  "published_date": "2024-01-15",
  "featured_image": {
    "path": "/storage/uploads/featured.jpg"
  },
  "excerpt": "A brief summary...",
  "categories": ["technology", "tutorials"],
  "layout": [
    // Layout components
  ]
}
```

## Restricting Layout Components

Limit which layout components are available per page type:

```json
{
  "name": "blog-post",
  "label": "Blog Post",
  "allowedComponents": ["heading", "richtext", "image", "code", "quote"]
}
```

This prevents content editors from using inappropriate components (e.g., no hero sections in blog posts).

## Best Practices

### Plan Your Types

Before creating page types, plan your site structure:
- What kinds of pages will you have?
- What unique fields does each type need?
- What layout components make sense for each?

### Keep Types Focused

Each page type should have a clear purpose. Avoid creating "catch-all" types with too many optional fields.

### Use Consistent Naming

- Use lowercase with hyphens: `blog-post`, `landing-page`
- Use clear labels: "Blog Post", "Landing Page"

### Consider SEO

Each page type might need different SEO fields or defaults. Plan accordingly.
