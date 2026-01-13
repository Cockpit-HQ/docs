# API

Access Lokalize translations through the REST API.

[[toc]]

## Get Project Translations

### `GET /api/lokalize/project/{name}`

Retrieve all translation strings for a project.

```bash
curl -X GET "https://cockpit.tld/api/lokalize/project/website" \
  -H "api-key: your-api-key"
```

```javascript
fetch('https://cockpit.tld/api/lokalize/project/website', {
  method: 'GET',
  headers: {
    'api-key': 'your-api-key'
  }
})
.then(response => response.json())
.then(translations => console.log(translations));
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Project name (required) |

#### Response

```json
{
  "nav.home": {
    "en": "Home",
    "de": "Startseite",
    "fr": "Accueil"
  },
  "nav.about": {
    "en": "About Us",
    "de": "Über uns",
    "fr": "À propos"
  },
  "button.submit": {
    "en": "Submit",
    "de": "Absenden",
    "fr": "Soumettre"
  }
}
```

## Get Single Locale

### `GET /api/lokalize/project/{name}/{locale}`

Retrieve translations for a specific locale only.

```bash
curl -X GET "https://cockpit.tld/api/lokalize/project/website/de" \
  -H "api-key: your-api-key"
```

```javascript
fetch('https://cockpit.tld/api/lokalize/project/website/de', {
  headers: { 'api-key': 'your-api-key' }
})
.then(response => response.json())
.then(translations => console.log(translations));
```

#### Response

```json
{
  "nav.home": "Startseite",
  "nav.about": "Über uns",
  "button.submit": "Absenden"
}
```

## Examples

### Build-Time Translation Loading

For static site generators, fetch translations at build time:

```javascript
// build.js
async function fetchTranslations(locale) {
  const response = await fetch(
    `${process.env.COCKPIT_URL}/api/lokalize/project/website/${locale}`,
    { headers: { 'api-key': process.env.COCKPIT_API_KEY } }
  );
  return response.json();
}

// Generate locale files
const locales = ['en', 'de', 'fr'];
for (const locale of locales) {
  const translations = await fetchTranslations(locale);
  fs.writeFileSync(
    `./locales/${locale}.json`,
    JSON.stringify(translations, null, 2)
  );
}
```

### Next.js Integration

```javascript
// lib/i18n.js
export async function getTranslations(locale) {
  const res = await fetch(
    `${process.env.COCKPIT_URL}/api/lokalize/project/website/${locale}`,
    {
      headers: { 'api-key': process.env.COCKPIT_API_KEY },
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
  return res.json();
}

// pages/index.js
export async function getStaticProps({ locale }) {
  const translations = await getTranslations(locale);
  return { props: { translations } };
}
```

### Nuxt.js Integration

```javascript
// plugins/i18n.js
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const { locale } = useI18n();

  const translations = await $fetch(
    `${config.public.cockpitUrl}/api/lokalize/project/website/${locale.value}`,
    { headers: { 'api-key': config.cockpitApiKey } }
  );

  return {
    provide: {
      t: (key) => translations[key] || key
    }
  };
});
```

### Caching Strategy

```javascript
class TranslationCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 60 * 60 * 1000; // 1 hour
  }

  async get(locale) {
    const cached = this.cache.get(locale);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const response = await fetch(
      `/api/lokalize/project/website/${locale}`,
      { headers: { 'api-key': 'your-api-key' } }
    );
    const data = await response.json();

    this.cache.set(locale, { data, timestamp: Date.now() });
    return data;
  }

  invalidate(locale) {
    if (locale) {
      this.cache.delete(locale);
    } else {
      this.cache.clear();
    }
  }
}

const translationCache = new TranslationCache();
```

### React Hook with Caching

```jsx
import { useState, useEffect, createContext, useContext } from 'react';

const I18nContext = createContext();

const cache = {};

export function I18nProvider({ children, defaultLocale = 'en' }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // Check cache first
      if (cache[locale]) {
        setTranslations(cache[locale]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch(
        `/api/lokalize/project/website/${locale}`,
        { headers: { 'api-key': 'your-api-key' } }
      );
      const data = await response.json();

      cache[locale] = data;
      setTranslations(data);
      setLoading(false);
    };

    loadTranslations();
  }, [locale]);

  const t = (key, fallback) => translations[key] || fallback || key;

  return (
    <I18nContext.Provider value={{ t, locale, setLocale, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
```

## Error Handling

### Project Not Found

```json
{
  "error": "Project 'unknown' not found"
}
```

**Status Code**: 404

### Locale Not Found

```json
{
  "error": "Locale 'xx' not configured for this project"
}
```

**Status Code**: 404

### Handle Errors

```javascript
async function loadTranslations(project, locale) {
  try {
    const response = await fetch(
      `/api/lokalize/project/${project}/${locale}`,
      { headers: { 'api-key': 'your-api-key' } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to load translations:', err.message);
    // Fallback to default locale or empty object
    return {};
  }
}
```
