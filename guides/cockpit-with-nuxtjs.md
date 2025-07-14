# Using Cockpit with Nuxt.js

Learn how to integrate Cockpit CMS as a headless backend for your Nuxt.js applications.

[[toc]]

## Overview

Cockpit CMS works seamlessly with Nuxt.js to create modern, performant web applications. This guide covers:

- Setting up Cockpit as a headless CMS backend
- Creating a Nuxt.js API client for Cockpit
- Implementing server-side rendering (SSR) and static generation
- Building dynamic pages with Nuxt Content
- Optimizing performance with caching and composables
- Real-time content updates with webhooks

## Project Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Cockpit CMS instance running (local or remote)
- Basic knowledge of Nuxt.js 3 and Vue.js

### Creating the Nuxt.js Project

```bash
npx nuxi@latest init my-cockpit-site
cd my-cockpit-site

# Install additional dependencies
npm install @nuxt/image
# Optional: for better DX
npm install -D @nuxtjs/tailwindcss
```

### Environment Configuration

Create `.env` in your Nuxt.js project:

```bash
# Cockpit API Configuration
NUXT_PUBLIC_COCKPIT_API_URL=http://localhost:8080/api
NUXT_COCKPIT_API_KEY=your-api-key-here

# Optional: For ISR and revalidation
NUXT_NITRO_PRESET=node-server
NUXT_REVALIDATION_SECRET=your-secret-token
```

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    cockpitApiKey: '', // NUXT_COCKPIT_API_KEY
    revalidationSecret: '', // NUXT_REVALIDATION_SECRET
    public: {
      cockpitApiUrl: '' // NUXT_PUBLIC_COCKPIT_API_URL
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  modules: [
    '@nuxt/image',
    '@nuxtjs/tailwindcss'
  ],

  image: {
    domains: ['localhost', 'your-cockpit-domain.com']
  }
})
```

## Cockpit API Client

### Composable API Client

Create `composables/useCockpit.ts`:

```typescript
interface CockpitOptions {
  filter?: Record<string, any>
  sort?: Record<string, number>
  limit?: number
  skip?: number
  populate?: number
  fields?: Record<string, number>
}

interface CockpitAsset {
  _id: string
  title?: string
  description?: string
  tags?: string[]
  size: number
  mime: string
  image?: boolean
  video?: boolean
  audio?: boolean
  archive?: boolean
  document?: boolean
  code?: boolean
  colors?: string[]
  width?: number
  height?: number
}

export const useCockpit = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.cockpitApiUrl
  const apiKey = config.cockpitApiKey

  const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${baseURL}${endpoint}`

    const fetchOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await $fetch<T>(url, fetchOptions)
      return response
    } catch (error) {
      console.error('Cockpit API Error:', error)
      throw error
    }
  }

  const getItems = async <T = any>(collection: string, options: CockpitOptions = {}): Promise<T[]> => {
    const params = new URLSearchParams()

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })

    const query = params.toString()
    const endpoint = `/content/items/${collection}${query ? `?${query}` : ''}`

    return request<T[]>(endpoint)
  }

  const getItem = async <T = any>(collection: string, id: string): Promise<T> => {
    return request<T>(`/content/item/${collection}/${id}`)
  }

  const getSingleton = async <T = any>(singleton: string): Promise<T> => {
    return request<T>(`/content/item/${singleton}`)
  }

  const getAsset = (asset: CockpitAsset, options: { w?: number, h?: number, q?: number } = {}) => {
    if (!asset?._id) return null

    const params = new URLSearchParams()
    if (options.w) params.append('w', options.w.toString())
    if (options.h) params.append('h', options.h.toString())
    if (options.q) params.append('q', options.q.toString())

    const query = params.toString()
    return `${baseURL}/assets/image/${asset._id}${query ? `?${query}` : ''}`
  }

  return {
    request,
    getItems,
    getItem,
    getSingleton,
    getAsset
  }
}
```

### Server-Side API Client

For server-only operations, create `server/utils/cockpit.ts`:

```typescript
import type { H3Event } from 'h3'

export const useCockpitServer = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const baseURL = config.public.cockpitApiUrl
  const apiKey = config.cockpitApiKey

  // Cache storage
  const cache = useStorage('cockpit')

  const request = async <T = any>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL: number = 60 // seconds
  ): Promise<T> => {
    // Check cache first
    if (cacheKey) {
      const cached = await cache.getItem<T>(cacheKey)
      if (cached) return cached
    }

    const url = `${baseURL}${endpoint}`

    const response = await $fetch<T>(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        ...options.headers,
      },
      ...options,
    })

    // Store in cache
    if (cacheKey) {
      await cache.setItem(cacheKey, response, { ttl: cacheTTL })
    }

    return response
  }

  return {
    request,
    // Include other methods from composable
  }
}
```

## Content Models Setup

Create the same content models as in the Next.js guide:

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

## Nuxt.js Implementation

### Blog Homepage

Create `pages/index.vue`:

```html
<template>
  <div>
    <header class="mb-12">
      <h1 class="text-4xl font-bold mb-4">{{ siteSettings?.site_title }}</h1>
      <p class="text-lg text-gray-600">{{ siteSettings?.site_description }}</p>
    </header>

    <main>
      <section>
        <h2 class="text-2xl font-bold mb-6">Latest Posts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="post in posts"
            :key="post._id"
            class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <NuxtImg
              v-if="post.featured_image"
              :src="cockpit.getAsset(post.featured_image, { w: 400, h: 200, q: 80 })"
              :alt="post.title"
              width="400"
              height="200"
              class="w-full h-48 object-cover"
            />
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">
                <NuxtLink :to="`/blog/${post.slug}`" class="hover:text-blue-600">
                  {{ post.title }}
                </NuxtLink>
              </h3>
              <p class="text-gray-600 mb-4">{{ post.excerpt }}</p>
              <div class="text-sm text-gray-500">
                <span>By {{ post.author }}</span>
                <time class="ml-4">{{ formatDate(post._created) }}</time>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  featured_image?: any
  author: string
  _created: number
}

interface SiteSettings {
  site_title: string
  site_description: string
  logo?: any
  social_links?: Record<string, string>
}

const cockpit = useCockpit()

// Fetch data
const { data } = await useAsyncData('homepage', async () => {
  const [posts, siteSettings] = await Promise.all([
    cockpit.getItems<Post>('posts', {
      filter: { published: true },
      sort: { _created: -1 },
      limit: 12,
      populate: 1
    }),
    cockpit.getSingleton<SiteSettings>('site_settings')
  ])

  return { posts, siteSettings }
})

const posts = computed(() => data.value?.posts || [])
const siteSettings = computed(() => data.value?.siteSettings)

// Helper function
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

// SEO
useHead({
  title: () => siteSettings.value?.site_title || 'Blog',
  meta: [
    { name: 'description', content: () => siteSettings.value?.site_description || '' }
  ]
})
</script>
```

### Dynamic Blog Post Pages

Create `pages/blog/[slug].vue`:

```html
<template>
  <article v-if="post" class="max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
      <NuxtImg
        v-if="post.featured_image"
        :src="cockpit.getAsset(post.featured_image, { w: 800, h: 400, q: 80 })"
        :alt="post.title"
        width="800"
        height="400"
        class="w-full rounded-lg mb-6"
      />
      <div class="text-gray-600 flex items-center gap-4">
        <span>By {{ post.author }}</span>
        <time>{{ formatDate(post._created) }}</time>
      </div>
    </header>

    <div
      class="prose prose-lg max-w-none"
      v-html="post.content"
    />

    <footer v-if="post.tags?.length" class="mt-8 pt-8 border-t">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in post.tags"
          :key="index"
          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
        >
          {{ tag }}
        </span>
      </div>
    </footer>
  </article>

  <div v-else-if="pending" class="text-center py-12">
    <p>Loading...</p>
  </div>

  <div v-else class="text-center py-12">
    <h1 class="text-2xl font-bold mb-4">Post not found</h1>
    <NuxtLink to="/" class="text-blue-600 hover:underline">
      Back to homepage
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
interface Post {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: any
  author: string
  published: boolean
  tags?: string[]
  _created: number
}

const route = useRoute()
const cockpit = useCockpit()

// Fetch post data
const { data: post, pending, error } = await useAsyncData(
  `post-${route.params.slug}`,
  async () => {
    // First get post by slug to find its ID
    const posts = await cockpit.getItems<Post>('posts', {
      filter: {
        slug: route.params.slug,
        published: true
      },
      fields: { _id: 1, slug: 1 },
      limit: 1
    })

    if (!posts || posts.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    // Use getItem to fetch the full post
    const fullPost = await cockpit.getItem<Post>('posts', posts[0]._id)

    if (!fullPost || !fullPost.published) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    return fullPost
  }
)

// Handle error
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

// Helper function
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

// SEO
useHead({
  title: () => post.value?.title || 'Post',
  meta: [
    { name: 'description', content: () => post.value?.excerpt || '' },
    { property: 'og:title', content: () => post.value?.title || '' },
    { property: 'og:description', content: () => post.value?.excerpt || '' },
    { property: 'og:image', content: () => post.value?.featured_image
      ? cockpit.getAsset(post.value.featured_image, { w: 1200, h: 630 })
      : ''
    }
  ]
})
</script>
```

### API Routes for Revalidation

Create `server/api/revalidate.post.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const query = getQuery(event)

  // Check for secret to confirm this is a valid request
  if (query.secret !== config.revalidationSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  try {
    const { collection, item } = body
    const nitroApp = useNitroApp()

    // Clear cached data based on the updated content
    switch (collection) {
      case 'posts':
        // Clear homepage cache
        await nitroApp.storage.removeItem('cockpit:homepage')

        // Clear specific post cache
        if (item?.slug) {
          await nitroApp.storage.removeItem(`cockpit:post-${item.slug}`)
        }
        break

      case 'site_settings':
        // Clear all cached pages that use site settings
        await nitroApp.storage.clear('cockpit:')
        break

      default:
        // Clear homepage cache for any other content
        await nitroApp.storage.removeItem('cockpit:homepage')
    }

    return { revalidated: true }
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error revalidating'
    })
  }
})
```

## Advanced Patterns

### Cockpit Image Component

Create `components/CockpitImage.vue`:

```html
<template>
  <NuxtImg
    v-if="asset?._id"
    :src="imageUrl"
    :alt="alt || asset.title || ''"
    :width="width"
    :height="height"
    :class="className"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
interface Props {
  asset?: {
    _id: string
    title?: string
  }
  width: number
  height: number
  quality?: number
  alt?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  quality: 80
})

const cockpit = useCockpit()

const imageUrl = computed(() => {
  if (!props.asset?._id) return null
  return cockpit.getAsset(props.asset, {
    w: props.width,
    h: props.height,
    q: props.quality
  })
})
</script>
```

### Search Functionality

Create `pages/search.vue`:

```html
<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Search</h1>

    <form @submit.prevent="handleSearch" class="mb-8">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search posts..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </form>

    <div v-if="results.length > 0" class="space-y-6">
      <h2 class="text-xl font-semibold">
        Results for "{{ route.query.q }}"
      </h2>
      <article
        v-for="post in results"
        :key="post._id"
        class="border-b pb-6"
      >
        <h3 class="text-xl font-semibold mb-2">
          <NuxtLink
            :to="`/blog/${post.slug}`"
            class="hover:text-blue-600"
          >
            {{ post.title }}
          </NuxtLink>
        </h3>
        <p class="text-gray-600">{{ post.excerpt }}</p>
      </article>
    </div>

    <div v-else-if="searched && !loading" class="text-gray-600">
      No results found for "{{ route.query.q }}"
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const cockpit = useCockpit()

const searchQuery = ref(route.query.q?.toString() || '')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  searched.value = true

  try {
    const searchResults = await cockpit.getItems('posts', {
      filter: {
        $or: [
          { title: { $regex: searchQuery.value, $options: 'i' } },
          { content: { $regex: searchQuery.value, $options: 'i' } },
          { excerpt: { $regex: searchQuery.value, $options: 'i' } }
        ],
        published: true
      },
      limit: 20
    })

    results.value = searchResults

    // Update URL without reload
    router.push({
      query: { q: searchQuery.value }
    })
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

// Search on mount if query exists
onMounted(() => {
  if (searchQuery.value) {
    handleSearch()
  }
})
</script>
```

### Global State Management

Create `stores/cockpit.ts`:

```typescript
export const useCockpitStore = defineStore('cockpit', () => {
  const siteSettings = ref(null)
  const navigation = ref([])

  const cockpit = useCockpit()

  const loadSiteSettings = async () => {
    if (siteSettings.value) return siteSettings.value

    try {
      const settings = await cockpit.getSingleton('site_settings')
      siteSettings.value = settings
      return settings
    } catch (error) {
      console.error('Failed to load site settings:', error)
      return null
    }
  }

  const loadNavigation = async () => {
    if (navigation.value.length > 0) return navigation.value

    try {
      const nav = await cockpit.getItems('navigation', {
        sort: { order: 1 }
      })
      navigation.value = nav
      return nav
    } catch (error) {
      console.error('Failed to load navigation:', error)
      return []
    }
  }

  return {
    siteSettings: readonly(siteSettings),
    navigation: readonly(navigation),
    loadSiteSettings,
    loadNavigation
  }
})
```

## Performance Optimization

### Static Generation

For static site generation, update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: async () => {
        // Generate routes for all published posts
        const cockpit = useCockpit()
        const posts = await cockpit.getItems('posts', {
          filter: { published: true },
          fields: { slug: 1 }
        })

        return posts.map(post => `/blog/${post.slug}`)
      }
    }
  }
})
```

### ISR with Nitro

Configure ISR in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  routeRules: {
    '/': { isr: 60 }, // Revalidate homepage every minute
    '/blog/**': { isr: 300 }, // Revalidate blog posts every 5 minutes
  }
})
```

### Data Fetching Optimization

Create `composables/useCockpitData.ts`:

```typescript
export const useCockpitData = <T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    immediate?: boolean
  } = {}
) => {
  const nuxtApp = useNuxtApp()

  // Use payload for SSR/SSG
  const cached = useState<T>(`cockpit-${key}`, () => null)

  const { data, pending, error, refresh } = useAsyncData(
    key,
    async () => {
      // Return cached data if available and fresh
      if (cached.value && options.ttl) {
        const cacheTime = nuxtApp.payload._cockpitCache?.[key]
        if (cacheTime && Date.now() - cacheTime < options.ttl * 1000) {
          return cached.value
        }
      }

      // Fetch fresh data
      const result = await fetcher()

      // Cache the result
      cached.value = result
      if (!nuxtApp.payload._cockpitCache) {
        nuxtApp.payload._cockpitCache = {}
      }
      nuxtApp.payload._cockpitCache[key] = Date.now()

      return result
    },
    {
      immediate: options.immediate !== false
    }
  )

  return {
    data: computed(() => data.value || cached.value),
    pending,
    error,
    refresh
  }
}
```

## Deployment

### Environment Variables

Set these environment variables in your deployment platform:

```bash
NUXT_PUBLIC_COCKPIT_API_URL=https://your-cockpit-instance.com/api
NUXT_COCKPIT_API_KEY=your-production-api-key
NUXT_REVALIDATION_SECRET=your-webhook-secret
```

## Best Practices

### 1. Type Safety

Define types for your content models:

```typescript
// types/cockpit.ts
export interface Post {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: CockpitAsset
  author: string
  published: boolean
  tags?: string[]
  _created: number
  _modified: number
}

export interface CockpitAsset {
  _id: string
  title?: string
  mime: string
  size: number
  width?: number
  height?: number
}
```

### 2. Error Handling

Always handle errors gracefully with Nuxt's error system:

```html
<script setup>
const { data, error } = await useAsyncData('posts', async () => {
  try {
    return await cockpit.getItems('posts')
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})

if (error.value) {
  throw createError(error.value)
}
</script>
```

### 3. SEO Optimization

Use Nuxt's built-in SEO features:

```html
<script setup>
useSeoMeta({
  title: post.value?.title,
  description: post.value?.excerpt,
  ogTitle: post.value?.title,
  ogDescription: post.value?.excerpt,
  ogImage: post.value?.featured_image
    ? cockpit.getAsset(post.value.featured_image, { w: 1200, h: 630 })
    : null,
  twitterCard: 'summary_large_image'
})
</script>
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure CORS in Cockpit for your Nuxt.js domain
2. **API Key Issues**: Ensure the API key is in server-side runtime config
3. **Hydration Mismatches**: Use `ClientOnly` wrapper for client-only content
4. **Image Loading**: Configure image domains in `nuxt.config.ts`

### Debug Mode

Add debug logging:

```typescript
// composables/useCockpit.ts
const request = async (endpoint: string, options = {}) => {
  if (process.dev) {
    console.log('Cockpit API Request:', endpoint, options)
  }

  // ... rest of request logic
}
```

This integration provides a complete foundation for building modern, performant applications with Nuxt.js and Cockpit CMS, leveraging Vue.js reactivity and Nuxt's powerful features.