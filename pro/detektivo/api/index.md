# API

Access Detektivo search functionality through the REST API.

[[toc]]

## Search Index

### `GET /api/detektivo/search/{index}`

Search within an existing index.

```bash
curl -X GET "https://cockpit.tld/api/detektivo/search/products?q=laptop" \
  -H "api-key: your-api-key"
```

```javascript
fetch('https://cockpit.tld/api/detektivo/search/products?q=laptop', {
  method: 'GET',
  headers: {
    'api-key': 'your-api-key'
  }
})
.then(response => response.json())
.then(results => console.log(results));
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `limit` | int | Maximum number of results to return (default: 50) |
| `offset` | int | Number of results to skip for pagination |

#### Response

```json
{
  "hits": [
    {
      "_id": "item123",
      "_score": 0.95,
      "title": "Gaming Laptop Pro",
      "description": "High-performance laptop for gaming..."
    },
    {
      "_id": "item456",
      "_score": 0.82,
      "title": "Business Laptop",
      "description": "Professional laptop for work..."
    }
  ],
  "total": 15,
  "query": "laptop",
  "limit": 50,
  "offset": 0
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `hits` | Array of matching documents |
| `hits[]._id` | Document ID |
| `hits[]._score` | Relevance score (higher is more relevant) |
| `total` | Total number of matching documents |
| `query` | The search query used |
| `limit` | Maximum results per page |
| `offset` | Current offset for pagination |

## Examples

### Basic Search

Search for "coffee" in a recipes index:

```javascript
const response = await fetch('/api/detektivo/search/recipes?q=coffee', {
  headers: { 'api-key': 'your-api-key' }
});
const { hits, total } = await response.json();

console.log(`Found ${total} recipes`);
hits.forEach(recipe => {
  console.log(`- ${recipe.title}`);
});
```

### Paginated Results

Fetch page 2 of results (10 per page):

```javascript
const page = 2;
const perPage = 10;
const offset = (page - 1) * perPage;

const response = await fetch(
  `/api/detektivo/search/articles?q=tutorial&limit=${perPage}&offset=${offset}`,
  { headers: { 'api-key': 'your-api-key' } }
);

const { hits, total } = await response.json();
const totalPages = Math.ceil(total / perPage);
```

### React Search Component

```jsx
import { useState, useEffect } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/detektivo/search/products?q=${encodeURIComponent(query)}`, {
      headers: { 'api-key': 'your-api-key' }
    })
    .then(res => res.json())
    .then(data => {
      setResults(data.hits);
      setLoading(false);
    });
  }, [query]);

  if (loading) return <div>Searching...</div>;

  return (
    <ul>
      {results.map(item => (
        <li key={item._id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### Vue Search Component

```vue
<template>
  <div>
    <input v-model="query" @input="search" placeholder="Search..." />
    <ul v-if="results.length">
      <li v-for="item in results" :key="item._id">
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const query = ref('');
const results = ref([]);

const search = async () => {
  if (!query.value) {
    results.value = [];
    return;
  }

  const response = await fetch(
    `/api/detektivo/search/products?q=${encodeURIComponent(query.value)}`,
    { headers: { 'api-key': 'your-api-key' } }
  );
  const data = await response.json();
  results.value = data.hits;
};
</script>
```

## Error Handling

### Index Not Found

```json
{
  "error": "Index 'unknown' not found"
}
```

**Status Code**: 404

### Missing Query

```json
{
  "error": "Search query required"
}
```

**Status Code**: 400

### Handle Errors

```javascript
try {
  const response = await fetch('/api/detektivo/search/products?q=laptop', {
    headers: { 'api-key': 'your-api-key' }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  // Process results
} catch (err) {
  console.error('Search failed:', err.message);
}
```
