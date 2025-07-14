# Using Cockpit with Next.js

Learn how to integrate Cockpit CMS as a headless backend for your Next.js applications.

[[toc]]

## Overview

Cockpit CMS provides an excellent headless CMS solution for Next.js applications. This guide shows you how to:

- Set up Cockpit as a content backend
- Fetch content using Cockpit's REST API
- Implement static generation and server-side rendering
- Handle dynamic routes and content updates
- Optimize performance with caching strategies

## Project Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Cockpit CMS instance running (local or remote)
- Basic knowledge of Next.js and React

### Creating the Next.js Project

```bash
npx create-next-app@latest my-cockpit-site
cd my-cockpit-site

# Install additional dependencies
npm install axios
# Optional: for type safety
npm install -D typescript @types/node @types/react
```

### Environment Configuration

Create `.env.local` in your Next.js project:

```bash
# Cockpit API Configuration
COCKPIT_API_URL=http://localhost:8080/api
COCKPIT_API_KEY=your-api-key-here

# Optional: For revalidation webhooks
REVALIDATION_SECRET=your-secret-token
```

## Cockpit API Client

### Basic API Client

Create `lib/cockpit.js`:

```javascript
const COCKPIT_API_URL = process.env.COCKPIT_API_URL;
const COCKPIT_API_KEY = process.env.COCKPIT_API_KEY;

class CockpitAPI {
  constructor() {
    this.baseURL = COCKPIT_API_URL;
    this.apiKey = COCKPIT_API_KEY;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cockpit API Error:', error);
      throw error;
    }
  }

  // Get collection items
  async getItems(collection, options = {}) {
    const params = new URLSearchParams();

    if (options.filter) {
      params.append('filter', JSON.stringify(options.filter));
    }
    if (options.sort) {
      params.append('sort', JSON.stringify(options.sort));
    }
    if (options.limit) {
      params.append('limit', options.limit);
    }
    if (options.skip) {
      params.append('skip', options.skip);
    }
    if (options.populate) {
      params.append('populate', options.populate);
    }

    const query = params.toString();
    const endpoint = `/content/items/${collection}${query ? `?${query}` : ''}`;

    return this.request(endpoint);
  }

  // Get single item
  async getItem(collection, id) {
    return this.request(`/content/item/${collection}/${id}`);
  }

  // Get singleton
  async getSingleton(singleton) {
    return this.request(`/content/item/${singleton}`);
  }

  // Get asset
  async getAsset(assetId) {
    return this.request(`/assets/asset/${assetId}`);
  }
}

export default new CockpitAPI();
```

### TypeScript API Client

For TypeScript projects, create `lib/cockpit.ts`:

```typescript
interface CockpitOptions {
  filter?: Record<string, any>;
  sort?: Record<string, number>;
  limit?: number;
  skip?: number;
  populate?: number;
}

interface CockpitResponse<T = any> {
  data?: T;
  error?: string;
}

class CockpitAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.COCKPIT_API_URL!;
    this.apiKey = process.env.COCKPIT_API_KEY!;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getItems<T = any>(collection: string, options: CockpitOptions = {}): Promise<T[]> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    const query = params.toString();
    const endpoint = `/content/items/${collection}${query ? `?${query}` : ''}`;

    return this.request<T[]>(endpoint);
  }

  async getItem<T = any>(collection: string, id: string): Promise<T> {
    return this.request<T>(`/content/item/${collection}/${id}`);
  }

  async getSingleton<T = any>(singleton: string): Promise<T> {
    return this.request<T>(`/content/item/${singleton}`);
  }
}

export default new CockpitAPI();
```

## Content Models Setup

### Example Content Models in Cockpit

Create these content models in your Cockpit admin:

**Posts Collection:**
```json
{
  "name": "posts",
  "type": "collection",
  "fields": [
    {"name": "title", "type": "text", "required": true},
    {"name": "slug", "type": "text", "required": true},
    {"name": "content", "type": "wysiwyg"},
    {"name": "excerpt", "type": "text"},
    {"name": "featured_image", "type": "asset"},
    {"name": "author", "type": "text"},
    {"name": "published", "type": "boolean", "default": false},
    {"name": "tags", "type": "tags"}
  ]
}
```

**Site Settings Singleton:**
```json
{
  "name": "site_settings",
  "type": "singleton",
  "fields": [
    {"name": "site_title", "type": "text"},
    {"name": "site_description", "type": "text"},
    {"name": "logo", "type": "asset"},
    {"name": "social_links", "type": "object"}
  ]
}
```

## Next.js Implementation

### Blog Homepage with Static Generation

Create `pages/index.js`:

```jsx
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import cockpit from '../lib/cockpit';

export default function HomePage({ posts, siteSettings }) {
  return (
    <div>
      <header>
        <h1>{siteSettings.site_title}</h1>
        <p>{siteSettings.site_description}</p>
      </header>

      <main>
        <section>
          <h2>Latest Posts</h2>
          <div className="grid">
            {posts.map((post) => (
              <article key={post._id} className="card">
                {post.featured_image && (
                  <Image
                    src={`${process.env.COCKPIT_API_URL}/assets/image/${post.featured_image._id}?w=400&h=200&q=80`}
                    alt={post.title}
                    width={400}
                    height={200}
                  />
                )}
                <h3>
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p>{post.excerpt}</p>
                <div className="meta">
                  <span>By {post.author}</span>
                  <time>{new Date(post._created * 1000).toLocaleDateString()}</time>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [posts, siteSettings] = await Promise.all([
      cockpit.getItems('posts', {
        filter: { published: true },
        sort: { _created: -1 },
        limit: 12,
        populate: 1
      }),
      cockpit.getSingleton('site_settings')
    ]);

    return {
      props: {
        posts,
        siteSettings,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        posts: [],
        siteSettings: {},
      },
    };
  }
};
```

### Dynamic Blog Post Pages

Create `pages/blog/[slug].js`:

```jsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import cockpit from '../../lib/cockpit';

export default function BlogPost({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        {post.featured_image && (
          <Image
            src={`${process.env.COCKPIT_API_URL}/assets/image/${post.featured_image._id}?w=800&h=400&q=80`}
            alt={post.title}
            width={800}
            height={400}
            priority
          />
        )}
        <div className="meta">
          <span>By {post.author}</span>
          <time>{new Date(post._created * 1000).toLocaleDateString()}</time>
        </div>
      </header>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags && post.tags.length > 0 && (
        <footer>
          <div className="tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await cockpit.getItems('posts', {
      filter: { published: true },
      fields: { slug: 1 }
    });

    const paths = posts.map((post) => ({
      params: { slug: post.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Enable ISR for new posts
    };
  } catch (error) {
    console.error('Error generating paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    // First get the post by slug to find its ID
    const posts = await cockpit.getItems('posts', {
      filter: {
        slug: params?.slug,
        published: true
      },
      fields: { _id: 1, slug: 1 },
      limit: 1
    });

    if (!posts || posts.length === 0) {
      return {
        notFound: true,
      };
    }

    // Use getItem to fetch the full post with all fields
    const post = await cockpit.getItem('posts', posts[0]._id);

    if (!post || !post.published) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        post,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true,
    };
  }
};
```

### API Route for Webhook Revalidation

Create `pages/api/revalidate.js`:

```javascript
export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const { collection, item } = req.body;

    // Revalidate specific pages based on the updated content
    switch (collection) {
      case 'posts':
        // Revalidate homepage
        await res.revalidate('/');

        // Revalidate the specific post page
        if (item?.slug) {
          await res.revalidate(`/blog/${item.slug}`);
        }
        break;

      case 'site_settings':
        // Revalidate all pages that use site settings
        await res.revalidate('/');
        break;

      default:
        // Revalidate homepage for any other content
        await res.revalidate('/');
    }

    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
```

## Advanced Patterns

### Custom Hook for Content Fetching

Create `hooks/useCockpit.js`:

```javascript
import { useState, useEffect } from 'react';
import cockpit from '../lib/cockpit';

export function useCockpitCollection(collection, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await cockpit.getItems(collection, options);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [collection, JSON.stringify(options)]);

  return { data, loading, error };
}

export function useCockpitSingleton(singleton) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await cockpit.getSingleton(singleton);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [singleton]);

  return { data, loading, error };
}
```

### Component for Cockpit Assets

Create `components/CockpitImage.jsx`:

```jsx
import Image from 'next/image';

export default function CockpitImage({
  asset,
  width,
  height,
  quality = 80,
  className,
  alt,
  ...props
}) {
  if (!asset) return null;

  const src = `${process.env.NEXT_PUBLIC_COCKPIT_API_URL}/assets/image/${asset._id}?w=${width}&h=${height}&q=${quality}`;

  return (
    <Image
      src={src}
      alt={alt || asset.title || ''}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}
```

### Search Functionality

Create `pages/search.js`:

```jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import cockpit from '../lib/cockpit';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState(router.query.q || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      const searchResults = await cockpit.getItems('posts', {
        filter: {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { excerpt: { $regex: query, $options: 'i' } }
          ],
          published: true
        },
        limit: 20
      });

      setResults(searchResults);

      // Update URL without reload
      router.push({
        pathname: '/search',
        query: { q: query }
      }, undefined, { shallow: true });

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Search</h1>

      <form onSubmit={handleSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="search-input"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="results">
          <h2>Results for "{router.query.q}"</h2>
          {results.map((post) => (
            <article key={post._id} className="result-item">
              <h3>
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Performance Optimization

### Image Optimization

Configure Next.js for Cockpit assets in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-cockpit-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_COCKPIT_API_URL: process.env.COCKPIT_API_URL,
  },
}

module.exports = nextConfig;
```

### Caching Strategy

Implement caching in your API client:

```javascript
class CockpitAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  getCacheKey(endpoint) {
    return endpoint;
  }

  async request(endpoint, options = {}) {
    const cacheKey = this.getCacheKey(endpoint);
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Fetch new data
    const response = await this.makeRequest(endpoint, options);

    // Cache the response
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return response;
  }
}
```

## Deployment

### Environment Variables

Set these environment variables in your deployment platform:

```bash
COCKPIT_API_URL=https://your-cockpit-instance.com/api
COCKPIT_API_KEY=your-production-api-key
REVALIDATION_SECRET=your-webhook-secret
NEXT_PUBLIC_COCKPIT_API_URL=https://your-cockpit-instance.com/api
```

### Webhook Setup in Cockpit

Create a custom API endpoint in Cockpit to trigger revalidation:

**config/api/webhook/nextjs.post.php**:
```php
<?php

$data = $this->request->body;

// Send webhook to Next.js
$webhookUrl = 'https://your-nextjs-site.com/api/revalidate?secret=' . $this->retrieve('nextjs_webhook_secret');

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhookUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

return [
    'success' => true,
    'response' => $response
];
```

## Best Practices

### 1. Error Handling

Always handle API errors gracefully:

```javascript
export const getStaticProps = async () => {
  try {
    const posts = await cockpit.getItems('posts');
    return { props: { posts } };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return { props: { posts: [] } };
  }
};
```

### 2. Type Safety

Use TypeScript interfaces for your content:

```typescript
interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: Asset;
  author: string;
  published: boolean;
  tags?: string[];
  _created: number;
}
```

### 3. SEO Optimization

Use Next.js Head component for SEO:

```jsx
import Head from 'next/head';

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featured_image && (
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_COCKPIT_API_URL}/assets/image/${post.featured_image._id}`} />
        )}
      </Head>
      {/* Content */}
    </>
  );
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure CORS in Cockpit for your Next.js domain
2. **API Key Issues**: Ensure your API key has proper permissions
3. **Image Loading**: Check that image domains are configured in `next.config.js`
4. **Revalidation**: Verify webhook URLs and secrets are correct

### Debug Mode

Add debug logging to your API client:

```javascript
async request(endpoint, options = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Cockpit API Request:', endpoint, options);
  }

  // ... rest of request logic
}
```
