# Menus

Create and manage navigation menus for your website.

[[toc]]

## Overview

Menus in Pages allow you to organize your pages into navigation structures for headers, footers, sidebars, or any other navigation element your website requires. While pages exist as standalone content, menus define how they're presented to visitors.

## Creating a Menu

1. Navigate to **Pages > Menus**
2. Click **Add Menu**
3. Enter a name for your menu (e.g., "main", "footer", "sidebar")
4. Save the menu

## Adding Pages to a Menu

Once you've created a menu:

1. Open the menu
2. Click **Add Item**
3. Select a page from your existing pages
4. Optionally set a custom title (defaults to page title)
5. Arrange items by dragging and dropping

### Menu Item Options

| Option | Description |
|--------|-------------|
| **Page** | Link to an existing page |
| **Title** | Custom display title (overrides page title) |
| **Target** | Link target (`_self`, `_blank`) |
| **Children** | Nested menu items for dropdowns |

## Nested Navigation

Create multi-level navigation by nesting menu items:

```
Main Menu
├── Home
├── Products
│   ├── Category A
│   ├── Category B
│   └── Category C
├── About
└── Contact
```

Drag items onto other items to create parent-child relationships.

## Fetching Menus via API

### Get All Menus

```javascript
fetch('/api/pages/menus', {
  headers: { 'api-key': 'your-api-key' }
})
.then(res => res.json())
.then(menus => console.log(menus));
```

### Get Single Menu

```javascript
fetch('/api/pages/menu/main', {
  headers: { 'api-key': 'your-api-key' }
})
.then(res => res.json())
.then(menu => console.log(menu));
```

### Menu Response Structure

```json
{
  "name": "main",
  "items": [
    {
      "title": "Home",
      "route": "/",
      "target": "_self",
      "children": []
    },
    {
      "title": "Products",
      "route": "/products",
      "children": [
        {
          "title": "Category A",
          "route": "/products/category-a",
          "children": []
        }
      ]
    }
  ]
}
```

## Rendering Menus

### React Example

```jsx
function Navigation({ menu }) {
  return (
    <nav>
      <ul>
        {menu.items.map(item => (
          <MenuItem key={item.route} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function MenuItem({ item }) {
  return (
    <li>
      <a href={item.route} target={item.target}>
        {item.title}
      </a>
      {item.children?.length > 0 && (
        <ul>
          {item.children.map(child => (
            <MenuItem key={child.route} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

### Vue Example

```vue
<template>
  <nav>
    <ul>
      <MenuItem v-for="item in menu.items" :key="item.route" :item="item" />
    </ul>
  </nav>
</template>

<script setup>
import MenuItem from './MenuItem.vue';
defineProps(['menu']);
</script>
```

## Best Practices

### Menu Naming

Use descriptive, lowercase names:
- `main` - Primary navigation
- `footer` - Footer links
- `sidebar` - Sidebar navigation
- `mobile` - Mobile-specific menu

### Keep It Simple

- Limit top-level items to 5-7 for usability
- Avoid deeply nested structures (max 2-3 levels)
- Use clear, concise titles

### Mobile Considerations

Consider creating separate menus for mobile navigation if your desktop menu is complex.
