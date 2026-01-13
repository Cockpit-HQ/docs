# Rendering Layouts

Implement layout rendering in your frontend application with examples for popular frameworks.

[[toc]]

## Overview

The layout API returns a tree structure of components that you need to render on your frontend. Each component has a `component` type, `data` object, and optionally `children` or `columns` for nested content.

## React Implementation

```jsx
// components/LayoutRenderer.jsx
import { marked } from 'marked';

const componentMap = {
  heading: ({ data }) => {
    const Tag = `h${data.level || 1}`;
    return <Tag>{data.text}</Tag>;
  },

  richtext: ({ data }) => (
    <div dangerouslySetInnerHTML={{ __html: data.html }} />
  ),

  markdown: ({ data }) => (
    <div dangerouslySetInnerHTML={{ __html: marked(data.markdown) }} />
  ),

  image: ({ data }) => (
    <figure>
      <img src={data.image?.path} alt={data.caption || ''} />
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  ),

  button: ({ data }) => (
    <a href={data.url} target={data.target} className="button">
      {data.caption}
    </a>
  ),

  section: ({ data, children }) => (
    <section className={data.class}>
      <LayoutRenderer components={children} />
    </section>
  ),

  grid: ({ data, columns }) => (
    <div className={`grid ${data.class || ''}`}>
      {columns?.map((col, i) => (
        <div key={i} className="grid-column">
          <LayoutRenderer components={col.components} />
        </div>
      ))}
    </div>
  ),

  spacer: ({ data }) => (
    <div style={{ height: `${(data.size || 1) * 1}rem` }} />
  ),

  // Custom components
  hero: ({ data }) => (
    <section
      className="hero"
      style={{ backgroundImage: `url(${data.image?.path})` }}
    >
      <h1>{data.headline}</h1>
      <p>{data.subheadline}</p>
      {data.cta_url && (
        <a href={data.cta_url} className="cta">{data.cta_text}</a>
      )}
    </section>
  ),
};

export function LayoutRenderer({ components = [] }) {
  return (
    <>
      {components.map((item, index) => {
        const Component = componentMap[item.component];

        if (!Component) {
          console.warn(`Unknown component: ${item.component}`);
          return null;
        }

        return (
          <Component
            key={item.id || index}
            data={item.data}
            children={item.children}
            columns={item.columns}
          />
        );
      })}
    </>
  );
}

// Usage in a page
export default function Page({ pageData }) {
  return (
    <main>
      <LayoutRenderer components={pageData.layout} />
    </main>
  );
}
```

## Vue 3 Implementation

```vue
<!-- components/LayoutRenderer.vue -->
<script setup>
import { h } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  components: { type: Array, default: () => [] }
});

const componentMap = {
  heading: (item) => h(`h${item.data.level || 1}`, item.data.text),

  richtext: (item) => h('div', { innerHTML: item.data.html }),

  markdown: (item) => h('div', { innerHTML: marked(item.data.markdown) }),

  image: (item) => h('figure', [
    h('img', { src: item.data.image?.path, alt: item.data.caption }),
    item.data.caption && h('figcaption', item.data.caption)
  ]),

  section: (item) => h('section', { class: item.data.class }, [
    h(LayoutRenderer, { components: item.children })
  ]),

  grid: (item) => h('div', { class: `grid ${item.data.class || ''}` },
    item.columns?.map(col =>
      h('div', { class: 'grid-column' }, [
        h(LayoutRenderer, { components: col.components })
      ])
    )
  ),

  hero: (item) => h('section', {
    class: 'hero',
    style: { backgroundImage: `url(${item.data.image?.path})` }
  }, [
    h('h1', item.data.headline),
    h('p', item.data.subheadline),
    item.data.cta_url && h('a', { href: item.data.cta_url }, item.data.cta_text)
  ])
};

const LayoutRenderer = {
  name: 'LayoutRenderer',
  props: { components: Array },
  setup(props) {
    return () => props.components?.map((item, i) => {
      const renderer = componentMap[item.component];
      return renderer ? renderer(item) : null;
    });
  }
};
</script>

<template>
  <component
    v-for="(item, index) in components"
    :key="item.id || index"
    :is="componentMap[item.component]?.(item)"
  />
</template>
```

## Next.js with Image Optimization

```jsx
// components/LayoutRenderer.jsx
import Image from 'next/image';

const COCKPIT_URL = process.env.NEXT_PUBLIC_COCKPIT_URL;

const componentMap = {
  image: ({ data }) => (
    <figure>
      <Image
        src={`${COCKPIT_URL}${data.image?.path}`}
        alt={data.caption || ''}
        width={800}
        height={600}
        style={{ objectFit: 'cover' }}
      />
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  ),

  // Use Cockpit's image API for thumbnails
  thumbnail: ({ data }) => (
    <Image
      src={`${COCKPIT_URL}/api/assets/image/${data.image?._id}?w=400&h=300&m=thumbnail`}
      alt={data.caption || ''}
      width={400}
      height={300}
    />
  ),

  // ... other components
};
```

### Server Component Pattern

```jsx
// app/[slug]/page.jsx
async function getPage(slug) {
  const res = await fetch(
    `${process.env.COCKPIT_URL}/api/content/item/pages?filter[slug]=${slug}`,
    { headers: { 'api-key': process.env.COCKPIT_API_KEY } }
  );
  return res.json();
}

export default async function Page({ params }) {
  const page = await getPage(params.slug);

  return (
    <main>
      <LayoutRenderer components={page.layout} />
    </main>
  );
}
```

## PHP/Twig Implementation

### PHP Class

```php
// LayoutRenderer.php
class LayoutRenderer {
    public function render(array $components): string {
        $html = '';
        foreach ($components as $item) {
            $html .= $this->renderComponent($item);
        }
        return $html;
    }

    protected function renderComponent(array $item): string {
        $method = 'render' . ucfirst($item['component']);
        if (method_exists($this, $method)) {
            return $this->$method($item);
        }
        return '';
    }

    protected function renderHeading(array $item): string {
        $level = $item['data']['level'] ?? 1;
        $text = htmlspecialchars($item['data']['text'] ?? '');
        return "<h{$level}>{$text}</h{$level}>";
    }

    protected function renderRichtext(array $item): string {
        return '<div class="richtext">' . ($item['data']['html'] ?? '') . '</div>';
    }

    protected function renderSection(array $item): string {
        $class = htmlspecialchars($item['data']['class'] ?? '');
        $children = $this->render($item['children'] ?? []);
        return "<section class=\"{$class}\">{$children}</section>";
    }

    protected function renderGrid(array $item): string {
        $class = htmlspecialchars($item['data']['class'] ?? '');
        $columns = '';
        foreach ($item['columns'] ?? [] as $col) {
            $colContent = $this->render($col['components'] ?? []);
            $columns .= "<div class=\"grid-column\">{$colContent}</div>";
        }
        return "<div class=\"grid {$class}\">{$columns}</div>";
    }
}
```

### Twig Template

```twig
{# layout.twig #}
{% macro render_component(item) %}
  {% import _self as layout %}

  {% if item.component == 'heading' %}
    <h{{ item.data.level|default(1) }}>{{ item.data.text }}</h{{ item.data.level|default(1) }}>

  {% elseif item.component == 'richtext' %}
    <div class="richtext">{{ item.data.html|raw }}</div>

  {% elseif item.component == 'image' %}
    <figure>
      <img src="{{ item.data.image.path }}" alt="{{ item.data.caption }}">
      {% if item.data.caption %}<figcaption>{{ item.data.caption }}</figcaption>{% endif %}
    </figure>

  {% elseif item.component == 'section' %}
    <section class="{{ item.data.class }}">
      {% for child in item.children %}
        {{ layout.render_component(child) }}
      {% endfor %}
    </section>

  {% elseif item.component == 'grid' %}
    <div class="grid {{ item.data.class }}">
      {% for column in item.columns %}
        <div class="grid-column">
          {% for comp in column.components %}
            {{ layout.render_component(comp) }}
          {% endfor %}
        </div>
      {% endfor %}
    </div>

  {% elseif item.component == 'hero' %}
    <section class="hero" style="background-image: url({{ item.data.image.path }})">
      <h1>{{ item.data.headline }}</h1>
      <p>{{ item.data.subheadline }}</p>
      {% if item.data.cta_url %}
        <a href="{{ item.data.cta_url }}" class="cta">{{ item.data.cta_text }}</a>
      {% endif %}
    </section>
  {% endif %}
{% endmacro %}

{% import _self as layout %}
{% for item in page.layout %}
  {{ layout.render_component(item) }}
{% endfor %}
```

## Astro Implementation

```astro
---
// components/LayoutRenderer.astro
import { marked } from 'marked';

const { components = [] } = Astro.props;

function renderComponent(item) {
  switch (item.component) {
    case 'heading':
      return `<h${item.data.level || 1}>${item.data.text}</h${item.data.level || 1}>`;
    case 'richtext':
      return `<div class="richtext">${item.data.html}</div>`;
    case 'markdown':
      return `<div>${marked(item.data.markdown)}</div>`;
    default:
      return '';
  }
}
---

{components.map(item => (
  <Fragment set:html={renderComponent(item)} />
))}
```

## Error Handling

Always handle unknown components gracefully:

```javascript
const Component = componentMap[item.component];
if (!Component) {
  console.warn(`Unknown component: ${item.component}`);
  return null; // or render a placeholder
}
```

### Development Mode Placeholder

```jsx
const UnknownComponent = ({ component }) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="unknown-component">
        Unknown component: {component}
      </div>
    );
  }
  return null;
};
```

## TypeScript Types

```typescript
interface LayoutComponent {
  component: string;
  label?: string;
  id?: string;
  data: Record<string, any>;
  children?: LayoutComponent[];
  columns?: { components: LayoutComponent[] }[];
}

interface LayoutRendererProps {
  components: LayoutComponent[];
}

type ComponentRenderer = (props: {
  data: Record<string, any>;
  children?: LayoutComponent[];
  columns?: { components: LayoutComponent[] }[];
}) => JSX.Element | null;

type ComponentMap = Record<string, ComponentRenderer>;
```

## Performance Tips

### Memoize Components

```jsx
import { memo } from 'react';

const MemoizedLayoutRenderer = memo(function LayoutRenderer({ components }) {
  // ... implementation
});
```

### Lazy Load Heavy Components

```jsx
import { lazy, Suspense } from 'react';

const VideoPlayer = lazy(() => import('./VideoPlayer'));

const componentMap = {
  video: ({ data }) => (
    <Suspense fallback={<div>Loading video...</div>}>
      <VideoPlayer src={data.src} />
    </Suspense>
  ),
};
```

### Use Intersection Observer for Images

```jsx
import { useInView } from 'react-intersection-observer';

const LazyImage = ({ data }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <figure ref={ref}>
      {inView && <img src={data.image?.path} alt={data.caption || ''} />}
    </figure>
  );
};
```
