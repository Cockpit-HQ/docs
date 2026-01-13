# Core Components

Reference for all built-in layout components and their data structures.

[[toc]]

## Overview

The values stored for each Layout field component are described by example in this section. When fetching data using Cockpit's API you'll get these values.

## Button

A clickable button element.

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Link destination |
| `caption` | string | Button text |
| `target` | string | Link target (`_self`, `_blank`) |

```json
{
  "component": "button",
  "label": "Example Button",
  "children": null,
  "data": {
    "url": "https://www.example.com",
    "caption": "Click Me",
    "target": "_self"
  }
}
```

## Grid

A multi-column grid container.

| Field | Type | Description |
|-------|------|-------------|
| `class` | string | CSS class |
| `colWidth` | string | Column width (`auto`, `1-2`, `1-3`, etc.) |
| `columns` | array | Array of column objects with `components` |

```json
{
  "component": "grid",
  "label": "Two Column Grid",
  "data": {
    "class": "my-grid",
    "colWidth": "1-2"
  },
  "columns": [
    { "components": [/* nested components */] },
    { "components": [/* nested components */] }
  ]
}
```

### Column Widths

| Value | Description |
|-------|-------------|
| `auto` | Equal width columns |
| `1-2` | 50% width |
| `1-3` | 33.33% width |
| `2-3` | 66.66% width |
| `1-4` | 25% width |
| `3-4` | 75% width |

## Heading

A headline element (h1-h6).

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Heading text |
| `level` | string | Heading level (1-6) |

```json
{
  "component": "heading",
  "data": {
    "text": "Welcome to Our Site",
    "level": "1"
  }
}
```

## HTML

Raw HTML content.

| Field | Type | Description |
|-------|------|-------------|
| `html` | string | Raw HTML markup |

```json
{
  "component": "html",
  "data": {
    "html": "<div class=\"custom\"><b>Hello</b> world.</div>"
  }
}
```

:::warning
Raw HTML is not sanitized. Only use with trusted content.
:::

## Image

An image element.

| Field | Type | Description |
|-------|------|-------------|
| `image` | object | Asset reference |
| `caption` | string | Image caption |

```json
{
  "component": "image",
  "data": {
    "image": {
      "_id": "asset-id",
      "path": "/storage/uploads/photo.jpg",
      "title": "Photo"
    },
    "caption": "A beautiful sunset"
  }
}
```

## Link

A hyperlink element.

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Link destination |
| `caption` | string | Link text |
| `target` | string | Link target |

```json
{
  "component": "link",
  "data": {
    "url": "https://www.example.com",
    "caption": "Visit Example",
    "target": "_blank"
  }
}
```

## Markdown

Markdown content.

| Field | Type | Description |
|-------|------|-------------|
| `markdown` | string | Markdown text |

```json
{
  "component": "markdown",
  "data": {
    "markdown": "## Hello World\n\nThis is **bold** and *italic* text."
  }
}
```

## Richtext

WYSIWYG HTML content.

| Field | Type | Description |
|-------|------|-------------|
| `html` | string | HTML from rich text editor |

```json
{
  "component": "richtext",
  "data": {
    "html": "<p>Hello <strong>world</strong>.</p><p>This is formatted content.</p>"
  }
}
```

## Section

A container for grouping components.

| Field | Type | Description |
|-------|------|-------------|
| `class` | string | CSS class |
| `children` | array | Nested components |

```json
{
  "component": "section",
  "data": {
    "class": "hero-section"
  },
  "children": [/* nested components */]
}
```

## Spacer

Vertical spacing element.

| Field | Type | Description |
|-------|------|-------------|
| `size` | string | Size multiplier (1-5) |

```json
{
  "component": "spacer",
  "data": {
    "size": "2"
  }
}
```

## Component Structure

All components share a common structure:

```json
{
  "component": "component-name",
  "label": "Optional Label",
  "id": "unique-id",
  "data": {
    // Component-specific fields
  },
  "children": [],    // For Section
  "columns": []      // For Grid
}
```

| Field | Description |
|-------|-------------|
| `component` | The component type identifier |
| `label` | Optional human-readable label |
| `id` | Unique identifier for the instance |
| `data` | Component-specific data fields |
| `children` | Nested components (Section only) |
| `columns` | Column data (Grid only) |
