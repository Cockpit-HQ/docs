# Custom Components

Create custom layout components tailored to your project's specific needs.

[[toc]]

## Overview

Create custom components for your specific needs. Go to **Settings > Layout Components** to manage your custom components.

## Creating Components

### Via Admin Interface

1. Navigate to **Settings > Layout Components**
2. Click **Create Component**
3. Configure the component name, label, and fields
4. Save the component

### Component Definition

Each component has the following properties:

| Property | Description |
|----------|-------------|
| `name` | Unique identifier (lowercase, no spaces) |
| `label` | Display name in the admin |
| `fields` | Array of field definitions |
| `group` | Optional group for organizing components |

## Example: Hero Component

A full-width hero section with headline, subheadline, background image, and call-to-action.

**Configuration:**

**Name:** `hero`
**Label:** `Hero Section`

**Fields:**
```json
[
  { "name": "headline", "type": "text", "label": "Headline" },
  { "name": "subheadline", "type": "text", "label": "Subheadline" },
  { "name": "image", "type": "asset", "label": "Background Image" },
  { "name": "cta_text", "type": "text", "label": "CTA Text" },
  { "name": "cta_url", "type": "text", "label": "CTA URL" }
]
```

**API Output:**

```json
{
  "component": "hero",
  "label": "Homepage Hero",
  "data": {
    "headline": "Welcome to Our Platform",
    "subheadline": "Build amazing things",
    "image": { "path": "/storage/uploads/hero-bg.jpg" },
    "cta_text": "Get Started",
    "cta_url": "/signup"
  }
}
```

## Example: Testimonial Component

Customer testimonial with quote, author info, and rating.

```json
{
  "name": "testimonial",
  "label": "Testimonial",
  "fields": [
    { "name": "quote", "type": "wysiwyg", "label": "Quote" },
    { "name": "author", "type": "text", "label": "Author Name" },
    { "name": "role", "type": "text", "label": "Author Role" },
    { "name": "avatar", "type": "asset", "label": "Avatar" },
    { "name": "rating", "type": "number", "label": "Rating (1-5)" }
  ]
}
```

## Example: Feature Card Component

For feature grids and highlights.

```json
{
  "name": "feature-card",
  "label": "Feature Card",
  "fields": [
    { "name": "icon", "type": "text", "label": "Icon Name" },
    { "name": "title", "type": "text", "label": "Title" },
    { "name": "description", "type": "textarea", "label": "Description" },
    { "name": "link_url", "type": "text", "label": "Link URL" },
    { "name": "link_text", "type": "text", "label": "Link Text" }
  ]
}
```

## Example: Pricing Table Component

For pricing pages with multiple tiers.

```json
{
  "name": "pricing-tier",
  "label": "Pricing Tier",
  "fields": [
    { "name": "name", "type": "text", "label": "Plan Name" },
    { "name": "price", "type": "text", "label": "Price" },
    { "name": "period", "type": "text", "label": "Billing Period" },
    { "name": "features", "type": "repeater", "label": "Features", "options": {
      "fields": [
        { "name": "text", "type": "text", "label": "Feature" },
        { "name": "included", "type": "boolean", "label": "Included" }
      ]
    }},
    { "name": "cta_text", "type": "text", "label": "Button Text" },
    { "name": "cta_url", "type": "text", "label": "Button URL" },
    { "name": "highlighted", "type": "boolean", "label": "Highlight This Plan" }
  ]
}
```

## Available Field Types

Use any Cockpit field type in your custom components:

| Field Type | Use Case |
|------------|----------|
| `text` | Short text, titles, URLs |
| `textarea` | Multi-line text |
| `wysiwyg` | Rich text content |
| `asset` | Images, files |
| `number` | Numeric values |
| `boolean` | Toggle options |
| `select` | Dropdown choices |
| `color` | Color picker |
| `date` | Date selection |
| `repeater` | Lists of items |
| `contentItemLink` | Reference to content items |

## Restricting Components

Control which components are available in a layout field:

```json
{
  "name": "content",
  "type": "layout",
  "options": {
    "allowedComponents": ["heading", "richtext", "image", "hero"]
  }
}
```

This ensures content authors only use approved components.

### Restricting by Group

Organize components into groups and allow specific groups:

```json
{
  "name": "content",
  "type": "layout",
  "options": {
    "allowedGroups": ["content", "media"]
  }
}
```

## Best Practices

### Keep Components Focused
Each component should have a single, clear purpose. Create multiple simple components rather than one complex one.

### Use Descriptive Field Labels
Help content editors understand what each field is for:

```json
// Good
{ "name": "cta_url", "type": "text", "label": "Call-to-Action URL (e.g., /signup)" }

// Less helpful
{ "name": "url", "type": "text", "label": "URL" }
```

### Add Field Descriptions
Use the `info` option to provide additional guidance:

```json
{
  "name": "image",
  "type": "asset",
  "label": "Hero Image",
  "opts": {
    "info": "Recommended size: 1920x1080px"
  }
}
```

### Group Related Components
Use the `group` property to organize components in the admin:

```json
{
  "name": "hero",
  "label": "Hero Section",
  "group": "Sections"
}
```
