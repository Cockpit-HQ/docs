# Using Cockpit with Remix

Learn how to integrate Cockpit CMS as a headless backend for your Remix applications.

[[toc]]

## Overview

Remix is a full-stack web framework that provides excellent integration with headless CMS solutions like Cockpit. This guide covers:

- Setting up Cockpit API client for Remix
- Server-side data fetching with loaders
- Form handling with actions
- Optimistic UI updates
- Image optimization and CDN integration
- Error boundaries and progressive enhancement

## Project Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Cockpit CMS instance running
- Basic knowledge of Remix and React

### Creating the Remix Project

```bash
npx create-remix@latest my-cockpit-app
cd my-cockpit-app

# Choose your deployment target
# Install dependencies
npm install

# Additional utilities
npm install tiny-invariant
```

### Environment Configuration

Create `.env` file:

```bash
# Cockpit Configuration
COCKPIT_API_URL=http://localhost:8080/api
COCKPIT_API_KEY=your-api-key-here
SESSION_SECRET=your-session-secret
```

## Cockpit API Client

### Server-Side API Client

Create `app/lib/cockpit.server.ts`:

```typescript
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.COCKPIT_API_URL, "COCKPIT_API_URL must be set");
invariant(process.env.COCKPIT_API_KEY, "COCKPIT_API_KEY must be set");

const COCKPIT_API_URL = process.env.COCKPIT_API_URL;
const COCKPIT_API_KEY = process.env.COCKPIT_API_KEY;

export interface CockpitOptions {
  filter?: Record<string, any>;
  sort?: Record<string, number>;
  limit?: number;
  skip?: number;
  populate?: number;
  fields?: Record<string, number>;
}

export interface CockpitAsset {
  _id: string;
  title?: string;
  description?: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
}

class CockpitAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = COCKPIT_API_URL;
    this.apiKey = COCKPIT_API_KEY;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Cockpit API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Cockpit API Error:', error);
      throw error;
    }
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

  getAssetUrl(assetId: string, params: { w?: number; h?: number; q?: number } = {}): string {
    const query = new URLSearchParams();
    if (params.w) query.append('w', params.w.toString());
    if (params.h) query.append('h', params.h.toString());
    if (params.q) query.append('q', params.q.toString());
    
    const queryString = query.toString();
    return `${this.baseURL}/assets/image/${assetId}${queryString ? `?${queryString}` : ''}`;
  }
}

export const cockpit = new CockpitAPI();

// Utility function to handle loader errors
export function handleLoaderError(error: unknown) {
  console.error('Loader error:', error);
  throw json(
    { error: 'Failed to load data' },
    { status: 500 }
  );
}
```

### Cache Utilities

Create `app/lib/cache.server.ts`:

```typescript
// Simple in-memory cache for development
// Use Redis or similar for production

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
```

## Content Models

Define TypeScript interfaces for your content:

Create `app/types/cockpit.ts`:

```typescript
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: CockpitAsset;
  author: string;
  published: boolean;
  tags?: string[];
  _created: number;
  _modified: number;
}

export interface CockpitAsset {
  _id: string;
  title?: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
}

export interface SiteSettings {
  site_title: string;
  site_description: string;
  logo?: CockpitAsset;
  social_links?: Record<string, string>;
}
```

## Remix Routes

### Root Layout

Update `app/root.tsx`:

```tsx
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { cockpit } from "~/lib/cockpit.server";
import type { SiteSettings } from "~/types/cockpit";

export const links: LinksFunction = () => [
  // Add your stylesheets here
];

export async function loader({ request }: LoaderFunctionArgs) {
  const siteSettings = await cockpit.getSingleton<SiteSettings>('site_settings');
  
  return json({ siteSettings });
}

export default function App() {
  const { siteSettings } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="font-bold text-xl">
                {siteSettings.site_title}
              </a>
              <div className="space-x-4">
                <a href="/blog" className="hover:text-blue-600">Blog</a>
                <a href="/search" className="hover:text-blue-600">Search</a>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### Homepage

Create `app/routes/_index.tsx`:

```tsx
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { cockpit, handleLoaderError } from "~/lib/cockpit.server";
import { cache } from "~/lib/cache.server";
import type { Post } from "~/types/cockpit";
import { CockpitImage } from "~/components/CockpitImage";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.siteSettings?.site_title || "Home" },
    { name: "description", content: data?.siteSettings?.site_description || "" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check cache first
    const cacheKey = 'homepage-posts';
    let posts = cache.get<Post[]>(cacheKey);
    
    if (!posts) {
      posts = await cockpit.getItems<Post>('posts', {
        filter: { published: true },
        sort: { _created: -1 },
        limit: 6,
        populate: 1,
      });
      
      // Cache for 5 minutes
      cache.set(cacheKey, posts);
    }

    const siteSettings = await cockpit.getSingleton('site_settings');

    return json({ posts, siteSettings });
  } catch (error) {
    return handleLoaderError(error);
  }
}

export default function Index() {
  const { posts, siteSettings } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{siteSettings.site_title}</h1>
        <p className="text-xl text-gray-600">{siteSettings.site_description}</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
              {post.featured_image && (
                <CockpitImage
                  asset={post.featured_image}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <time className="ml-2">
                    {new Date(post._created * 1000).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Blog List

Create `app/routes/blog._index.tsx`:

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { cockpit } from "~/lib/cockpit.server";
import type { Post } from "~/types/cockpit";
import { CockpitImage } from "~/components/CockpitImage";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 12;
  const skip = (page - 1) * perPage;

  const posts = await cockpit.getItems<Post>('posts', {
    filter: { published: true },
    sort: { _created: -1 },
    limit: perPage,
    skip,
    populate: 1,
  });

  // Get total count for pagination
  const allPosts = await cockpit.getItems<Post>('posts', {
    filter: { published: true },
    fields: { _id: 1 },
  });
  
  const total = allPosts.length;
  const totalPages = Math.ceil(total / perPage);

  return json({ posts, page, totalPages });
}

export default function BlogIndex() {
  const { posts, page, totalPages } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
            {post.featured_image && (
              <CockpitImage
                asset={post.featured_image}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="text-sm text-gray-500">
                <span>By {post.author}</span>
                <time className="ml-2">
                  {new Date(post._created * 1000).toLocaleDateString()}
                </time>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              to={`?page=${pageNum}`}
              className={`px-3 py-1 rounded ${
                pageNum === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Blog Post Detail

Create `app/routes/blog.$slug.tsx`:

```tsx
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { cockpit } from "~/lib/cockpit.server";
import type { Post } from "~/types/cockpit";
import { CockpitImage } from "~/components/CockpitImage";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [{ title: "Post not found" }];
  }

  return [
    { title: data.post.title },
    { name: "description", content: data.post.excerpt || "" },
    { property: "og:title", content: data.post.title },
    { property: "og:description", content: data.post.excerpt || "" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.slug, "slug is required");

  // First get the post by slug to find its ID
  const posts = await cockpit.getItems<Post>('posts', {
    filter: { 
      slug: params.slug,
      published: true 
    },
    fields: { _id: 1, slug: 1 },
    limit: 1,
  });

  if (!posts || posts.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }

  // Use getItem to fetch the full post data by ID
  const post = await cockpit.getItem<Post>('posts', posts[0]._id);

  if (!post || !post.published) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ post });
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.featured_image && (
          <CockpitImage
            asset={post.featured_image}
            width={800}
            height={400}
            className="w-full rounded-lg mb-6"
          />
        )}
        <div className="text-gray-600 flex items-center gap-4">
          <span>By {post.author}</span>
          <time>{new Date(post._created * 1000).toLocaleDateString()}</time>
        </div>
      </header>

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags && post.tags.length > 0 && (
        <footer className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <Link to="/blog" className="text-blue-600 hover:underline">
        Back to blog
      </Link>
    </div>
  );
}
```

### Search Functionality

Create `app/routes/search.tsx`:

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { cockpit } from "~/lib/cockpit.server";
import type { Post } from "~/types/cockpit";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (!query) {
    return json({ posts: [], query });
  }

  const posts = await cockpit.getItems<Post>('posts', {
    filter: {
      $and: [
        { published: true },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { excerpt: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    },
    sort: { _created: -1 },
    limit: 20,
  });

  return json({ posts, query });
}

export default function Search() {
  const { posts, query } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <Form method="get" className="mb-8">
        <div className="flex gap-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </Form>

      {query && posts.length === 0 && (
        <p className="text-gray-600">No results found for "{query}"</p>
      )}

      {posts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Results for "{query}"
          </h2>
          {posts.map((post) => (
            <article key={post._id} className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-2">
                <Link
                  to={`/blog/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600">{post.excerpt}</p>
              <div className="text-sm text-gray-500 mt-2">
                <span>By {post.author}</span>
                <time className="ml-2">
                  {new Date(post._created * 1000).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Components

### Cockpit Image Component

Create `app/components/CockpitImage.tsx`:

```tsx
import { cockpit } from "~/lib/cockpit.server";
import type { CockpitAsset } from "~/types/cockpit";

interface CockpitImageProps {
  asset: CockpitAsset;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  alt?: string;
}

export function CockpitImage({
  asset,
  width,
  height,
  quality = 80,
  className,
  alt,
  ...props
}: CockpitImageProps) {
  if (!asset?._id) return null;

  const src = cockpit.getAssetUrl(asset._id, { w: width, h: height, q: quality });

  return (
    <img
      src={src}
      alt={alt || asset.title || ''}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
```

## Form Handling

### Contact Form Example

Create `app/routes/contact.tsx`:

```tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { cockpit } from "~/lib/cockpit.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Validate
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";
  if (!email) errors.email = "Email is required";
  if (!message) errors.message = "Message is required";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  try {
    // Save to Cockpit collection
    await cockpit.request('/content/item/messages', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name,
          email,
          message,
          submitted_at: new Date().toISOString(),
        }
      }),
    });

    return redirect("/contact?success=true");
  } catch (error) {
    return json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {actionData?.errors?.name && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {actionData?.errors?.email && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={5}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {actionData?.errors?.message && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </Form>
    </div>
  );
}
```

## Advanced Patterns

### Resource Routes for API

Create `app/routes/api.posts.tsx`:

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { cockpit } from "~/lib/cockpit.server";
import type { Post } from "~/types/cockpit";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = parseInt(url.searchParams.get("skip") || "0");

  const posts = await cockpit.getItems<Post>('posts', {
    filter: { published: true },
    sort: { _created: -1 },
    limit,
    skip,
    fields: {
      _id: 1,
      title: 1,
      slug: 1,
      excerpt: 1,
      author: 1,
      _created: 1,
    },
  });

  return json({ posts });
}
```

### Optimistic UI Updates

```tsx
import { useFetcher } from "@remix-run/react";

export default function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const fetcher = useFetcher();
  
  const likes = fetcher.formData 
    ? parseInt(fetcher.formData.get("likes") as string) 
    : initialLikes;

  return (
    <fetcher.Form method="post" action="/api/like">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="likes" value={likes + 1} />
      <button
        type="submit"
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <span>👍</span>
        <span>{likes}</span>
      </button>
    </fetcher.Form>
  );
}
```

### Streaming with Defer

```tsx
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader() {
  // Load critical data immediately
  const posts = cockpit.getItems('posts', { limit: 6 });
  
  // Defer non-critical data
  const relatedPostsPromise = cockpit.getItems('posts', {
    filter: { tags: { $in: ['featured'] } },
    limit: 3,
  });

  return defer({
    posts: await posts,
    relatedPosts: relatedPostsPromise,
  });
}

export default function Page() {
  const { posts, relatedPosts } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Render main content immediately */}
      <div>{/* Render posts */}</div>

      {/* Stream related posts when ready */}
      <Suspense fallback={<div>Loading related posts...</div>}>
        <Await resolve={relatedPosts}>
          {(relatedPosts) => (
            <div>{/* Render related posts */}</div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

## Performance Optimization

### Headers and Caching

```tsx
export function headers() {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}
```

### Prefetching

```tsx
import { Link, PrefetchPageLinks } from "@remix-run/react";

export default function BlogList() {
  return (
    <>
      <PrefetchPageLinks page="/blog/popular-post" />
      <Link to="/blog/popular-post" prefetch="intent">
        Popular Post
      </Link>
    </>
  );
}
```

## Deployment

### Environment Variables

Set these in your deployment platform:

```bash
COCKPIT_API_URL=https://your-cockpit-instance.com/api
COCKPIT_API_KEY=your-production-api-key
SESSION_SECRET=your-session-secret
```

### Build Configuration

Update `remix.config.js` for your deployment target:

```javascript
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: "vercel", // or "netlify", "node-cjs", etc.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: ["**/.*"],
  future: {
    v2_routeConvention: true,
  },
};
```

## Best Practices

### 1. Error Boundaries

Always implement error boundaries:

```tsx
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  
  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

### 2. Type Safety

Use TypeScript and proper types:

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Post } from "~/types/cockpit";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.slug, "Expected params.slug");
  // ... rest of loader
}
```

### 3. Progressive Enhancement

Forms work without JavaScript:

```tsx
<Form method="post" className="search-form">
  <input
    type="search"
    name="q"
    defaultValue={query}
  />
  <button type="submit">Search</button>
</Form>
```

## Troubleshooting

### Common Issues

1. **Server/Client Mismatch**: Ensure environment variables are properly set
2. **CORS Issues**: Configure Cockpit to allow your domain
3. **Build Errors**: Check TypeScript types and imports
4. **Slow Loaders**: Implement caching and use defer for non-critical data

### Debug Logging

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("Cockpit request:", endpoint, options);
}
```

This integration provides a solid foundation for building performant, progressively enhanced web applications with Remix and Cockpit CMS.