# Layout

::: tip Important notes
Note, that addons may have to be installed manually because they are not shipped with Cockpit's default setup.
:::

[[toc]]

## Introduction

Layouts are Cockpit's way of creating content organized in a structured way as required by websites and applications. As a headless cms Cockpit stores and serves layout data over its API for [Pages](/addons/pages/) and [Content](/features/content/) such as collections and singletons. The client fetching data from Cockpit's API should handle the components to create the layout, i.e. HTML for a website.

Generally speaking the probably most common use case for *Layout* is within [Pages](/addons/pages/), which allow composing a layout containing data organized in components. The *Layout* itself actually is just a field of type [Layout](/features/basics/#layout) as described in the list of field types. By default, Cockpit comes with a list of layout components described in this section.

![Screenshot of the list of core layout components available for layout field types](./list-of-all-core-layout-components.png)

## Components

The values stored foreach [Layout](/features/basics/#layout) field component are described by example in this section of the documentations as *Example result*. When fetching data using Cockpit's [API](/api/) you'll get these values.

### Button

Use the *Button* component whenever you want to have a button in your layout. The component does not have children. You can provide

* url
* caption
* target

Example result:

```json:no-line-numbers
{
    "component": "button",
    "label": "Example Button",
    "children": null,
    "data": {
        "url": "https://www.example.com",
        "caption": null,
        "target": "_self"
    }
}
```

### Grid

Use the *Grid* component whenever you want to organize your content in a grid of one or more column(s). Within the grid each column defined contains the components you provide (the children). You can provide

* class
* colWith

Example result:

```json:no-line-numbers
{
  "component": "grid",
  "label": "Example Grid",
  "children": null,
  "data": {
    "class": "example-grid-css-class",
    "colWidth": "auto"
  },
  "columns": [
    {
      "data": [],
      "components": []
    },
    {
      "data": [],
      "components": []
    }
    // ...more columns here
  ]
}
```

### Heading

Use the *Heading* component whenever you want to have a headline in your layout. The component does not have children. You can provide

* text
* level

Example result:

```json:no-line-numbers
{
    "component": "heading",
    "label": "Example heading",
    "children": null,
    "data": {
        "text": "H1 example",
        "level": "1"
    }
}
```

### HTML

Use the *HTML* component whenever you want to provide HTML content in your layout. In contrast to the [Richtext](#richtext) component plain HTML has to be written. The component does not have children. You can provide

* html

Example result:

```json:no-line-numbers
{
    "component": "html",
    "label": "Example HTML",
    "children": null,
    "data": {
        "html": "<b>Hello</b> world.\n\nThis is example HTML content."
    }
}
```

### Link

Use the *Link* component whenever you want to provide a link in your layout. The component does not have children. You can provide

* url
* caption
* target

Example result:

```json:no-line-numbers
{
    "component": "link",
    "label": "Example link",
    "children": null,
    "data": {
        "url": "https://www.example.com",
        "caption": null,
        "target": "_self"
    }
}
```

### Markdown

Use the *Markdown* component whenever you want to provide markdown in your layout. Providing markdown does not necessarily mean, that the client uses the content provided as markdown the same way. You can use markdown to write your content as an alternative to the [Richtext](#richtext) or [HTML](#html) components. The client consuming Cockpit's API may render it appropriately, i.e. as HTML for a website. The component does not have children. You can provide

* markdown

Example result:

```json:no-line-numbers
{
    "component": "markdown",
    "label": "Example markdown",
    "children": null,
    "data": {
        "markdown": "**Example** markdown.\n\nThis is *example* markdown."
    }
}
```

### Richtext

Use the *Richtext* component whenever you want to provide HTML in your layout without writing plain HTML as with the [HTML](#html) component. The component does not have children. You can provide

* html

Example result:

```json:no-line-numbers
{
    "component": "richtext",
    "label": "Example richtext",
    "children": null,
    "data": {
        "html": "<p>Hello <strong>world</strong>.</p>\n<p>&nbsp;</p>\n<p>This is HTML <em>created </em>with a richtext editor.</p>"
    }
}
```

### Section

Use the *Section* component whenever you want to group content in your layout. Organizing content in sections can be very useful if content is related, i.e. a heading, text and image belong to each other. The component has children. You can provide

* class

Example result:

```json:no-line-numbers
{
    "component": "section",
    "label": "Example section",
    "children": [],
    "data": {
        "class": "example-section-css-class"
    }
}
```

### Spacer

Use the *Spacer* component whenever you want to ensure a spacing in your layout. The component has children. You can provide

* size

Example result:

```json:no-line-numbers
{
    "component": "spacer",
    "label": "Example spacer",
    "children": null,
    "data": {
        "size": "2"
    }
}
```