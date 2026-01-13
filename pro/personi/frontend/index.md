# Frontend Integration

Learn how to integrate Personi personalization into your frontend applications with examples for popular frameworks.

[[toc]]

## Overview

Personi works by passing audience tags via the `personi` query parameter. Your frontend determines the user's audience based on authentication state, cookies, device type, location, or any other criteria.

## Next.js / React

```javascript
// lib/cockpit.js
export async function getPersonalizedContent(model, audience = []) {
  const params = new URLSearchParams({
    personi: audience.join(','),
  });

  const res = await fetch(
    `${process.env.COCKPIT_URL}/api/content/item/${model}?${params}`,
    { headers: { 'api-key': process.env.COCKPIT_API_KEY } }
  );

  return res.json();
}

// pages/index.js
export async function getServerSideProps({ req }) {
  // Determine audience from user session, cookies, etc.
  const audience = [];
  if (req.cookies.member) audience.push('member');
  if (req.cookies.premium) audience.push('premium');

  const homepage = await getPersonalizedContent('homepage', audience);

  return { props: { homepage } };
}
```

### With App Router

```javascript
// app/page.js
import { cookies } from 'next/headers';

async function getPersonalizedContent(model, audience) {
  const params = new URLSearchParams({ personi: audience.join(',') });

  const res = await fetch(
    `${process.env.COCKPIT_URL}/api/content/item/${model}?${params}`,
    {
      headers: { 'api-key': process.env.COCKPIT_API_KEY },
      next: { revalidate: 60 }
    }
  );

  return res.json();
}

export default async function HomePage() {
  const cookieStore = cookies();

  const audience = [];
  if (cookieStore.get('member')) audience.push('member');
  if (cookieStore.get('premium')) audience.push('premium');

  const content = await getPersonalizedContent('homepage', audience);

  return <main>{/* render content */}</main>;
}
```

## Vue / Nuxt

```javascript
// composables/useCockpit.js
export const usePersonalizedContent = async (model, audience = []) => {
  const config = useRuntimeConfig();

  return await $fetch(`/api/content/item/${model}`, {
    baseURL: config.public.cockpitUrl,
    params: { personi: audience.join(',') },
    headers: { 'api-key': config.cockpitApiKey }
  });
};
```

### Nuxt 3 Page Example

```vue
<script setup>
const { data: content } = await useAsyncData('homepage', async () => {
  const audience = [];

  // Check user state
  const user = useUser();
  if (user.value?.isMember) audience.push('member');
  if (user.value?.isPremium) audience.push('premium');

  return usePersonalizedContent('homepage', audience);
});
</script>

<template>
  <div>
    <h1>{{ content.hero.title }}</h1>
    <p>{{ content.hero.subtitle }}</p>
  </div>
</template>
```

## Vanilla JavaScript

```javascript
async function fetchPersonalized(model, audience) {
  const url = new URL(`/api/content/item/${model}`, COCKPIT_URL);
  url.searchParams.set('personi', audience.join(','));

  const response = await fetch(url, {
    headers: { 'api-key': API_KEY }
  });

  return response.json();
}

// Usage with user detection
const audience = [];
if (localStorage.getItem('memberToken')) audience.push('member');
if (window.innerWidth < 768) audience.push('mobile');

const content = await fetchPersonalized('homepage', audience);
```

## Astro

```astro
---
// src/pages/index.astro
const audience = [];

// Check for member cookie
if (Astro.cookies.get('member')) {
  audience.push('member');
}

// Device detection (server-side)
const userAgent = Astro.request.headers.get('user-agent') || '';
if (/Mobile|Android|iPhone/i.test(userAgent)) {
  audience.push('mobile');
}

const params = new URLSearchParams({ personi: audience.join(',') });
const response = await fetch(
  `${import.meta.env.COCKPIT_URL}/api/content/item/homepage?${params}`,
  { headers: { 'api-key': import.meta.env.COCKPIT_API_KEY } }
);
const content = await response.json();
---

<html>
  <body>
    <h1>{content.hero.title}</h1>
  </body>
</html>
```

## SvelteKit

```javascript
// src/routes/+page.server.js
export async function load({ cookies, fetch }) {
  const audience = [];

  if (cookies.get('member')) audience.push('member');
  if (cookies.get('premium')) audience.push('premium');

  const params = new URLSearchParams({ personi: audience.join(',') });

  const response = await fetch(
    `${COCKPIT_URL}/api/content/item/homepage?${params}`,
    { headers: { 'api-key': COCKPIT_API_KEY } }
  );

  return {
    content: await response.json()
  };
}
```

## Client-Side Personalization

For client-side only personalization (e.g., A/B testing):

```javascript
// Randomly assign user to test group
function getTestGroup() {
  let group = localStorage.getItem('ab_group');

  if (!group) {
    group = Math.random() < 0.5 ? 'test-a' : 'test-b';
    localStorage.setItem('ab_group', group);
  }

  return group;
}

// Fetch with test group
async function fetchContent() {
  const audience = [getTestGroup()];

  // Add other audience tags
  if (document.cookie.includes('member=')) {
    audience.push('member');
  }

  const response = await fetch(
    `/api/content/item/homepage?personi=${audience.join(',')}`
  );

  return response.json();
}
```

## Geo-Targeted Content

```javascript
// Server-side geo detection (using IP geolocation service)
async function getAudienceWithGeo(req) {
  const audience = [];

  // Get country from geo service or CDN header
  const country = req.headers['cf-ipcountry'] ||
                  req.headers['x-vercel-ip-country'] ||
                  await getCountryFromIP(req.ip);

  // Map country to region
  const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'];

  if (euCountries.includes(country)) {
    audience.push('region-eu');
  } else if (country === 'US') {
    audience.push('region-us');
  }

  return audience;
}
```

## Caching Considerations

When caching personalized content, ensure cache keys include the audience:

```javascript
// Example with SWR
import useSWR from 'swr';

function usePersonalizedContent(model, audience) {
  const cacheKey = `${model}-${audience.sort().join(',')}`;

  return useSWR(cacheKey, () => fetchPersonalized(model, audience));
}
```

For CDN caching, use cache vary headers:

```javascript
// API route that proxies Cockpit
export default async function handler(req, res) {
  const audience = determineAudience(req);
  const content = await fetchPersonalized('homepage', audience);

  // Vary cache by audience
  res.setHeader('Vary', 'Cookie');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  res.json(content);
}
```
