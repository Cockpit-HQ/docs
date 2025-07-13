# Creating File-Based API Endpoints

Learn how to create custom API endpoints using Cockpit's file-based routing system.

[[toc]]

## Overview

Cockpit CMS provides a powerful file-based API routing system that allows you to create custom REST API endpoints by simply creating PHP files in the appropriate directory structure. This approach offers flexibility and simplicity for building custom APIs alongside Cockpit's built-in content APIs.

## How It Works

Cockpit's API system looks for files in the `config/api/` directory and automatically maps them to API endpoints based on their file paths and names. The system supports:

- **HTTP Method-specific files**: `endpoint.get.php`, `endpoint.post.php`, etc.
- **Generic endpoints**: `endpoint.php` (handles all HTTP methods)
- **Catch-all routes**: Using `[...all].php` patterns with parameter support
- **Nested directory structures**: For organizing complex APIs

## Directory Structure

```
your-project/
|-- config/
|   `-- api/                    # API endpoints directory
|       |-- users.php           # GET /api/users
|       |-- users.post.php      # POST /api/users
|       |-- user/
|       |   |-- profile.php     # GET /api/user/profile
|       |   `-- [...all].php    # Catch-all: /api/user/anything/else
|       `-- products/
|           |-- index.php       # GET /api/products/
|           `-- [...all].php    # Catch-all: /api/products/123
|-- cockpit/                    # Cockpit installation
`-- index.php                   # Your application
```

## Basic API Endpoints

### Simple GET Endpoint

Create `config/api/hello.php`:

```php
<?php

// Simple response
return [
    'message' => 'Hello World!',
    'timestamp' => time()
];
```

**Access**: `GET /api/hello`

### HTTP Method-Specific Endpoints

Create method-specific files for different HTTP verbs:

**config/api/users.get.php**:
```php
<?php

// GET /api/users
$users = $this->dataStorage->find('users')->toArray();

return [
    'users' => $users,
    'total' => count($users)
];
```

**config/api/users.post.php**:
```php
<?php

// POST /api/users
$data = $this->request->body;

// Validate required fields
if (!isset($data['name']) || !isset($data['email'])) {
    $this->response->status = 400;
    return ['error' => 'Name and email are required'];
}

// Save user
$user = [
    'name' => $data['name'],
    'email' => $data['email'],
    '_created' => time()
];

$this->dataStorage->save('users', $user);

return [
    'success' => true,
    'user' => $user
];
```

**config/api/users.delete.php**:
```php
<?php

// DELETE /api/users
$data = $this->request->body;

if (!isset($data['id'])) {
    $this->response->status = 400;
    return ['error' => 'User ID is required'];
}

$result = $this->dataStorage->remove('users', ['_id' => $data['id']]);

return [
    'success' => $result > 0,
    'deleted' => $result
];
```

## Dynamic Routes with Catch-All

### Basic Dynamic Route

Create `config/api/user/[...all].php`:

```php
<?php

// The $API_ARGS variable contains route segments
$segments = $API_ARGS;

// For /api/user/123, $API_ARGS = ['123']
// For /api/user/profile/settings, $API_ARGS = ['profile', 'settings']

$userId = $segments[0] ?? null;

if (!$userId) {
    $this->response->status = 400;
    return ['error' => 'User ID is required'];
}

$user = $this->dataStorage->findOne('users', ['_id' => $userId]);

if (!$user) {
    $this->response->status = 404;
    return ['error' => 'User not found'];
}

return [
    'user' => $user
];
```

**Access**: `GET /api/user/123` (where `123` is the user ID)

### Named Parameters

You can use named parameters with colons in catch-all routes:

Create `config/api/user/[...all].php`:

**Access**: `GET /api/user/id:123/profile:basic`

```php
<?php

// $API_ARGS will contain: ['id' => '123', 'profile' => 'basic']
$userId = $API_ARGS['id'] ?? null;
$profileType = $API_ARGS['profile'] ?? 'full';

$user = $this->dataStorage->findOne('users', ['_id' => $userId]);

if (!$user) {
    $this->response->status = 404;
    return ['error' => 'User not found'];
}

// Return different data based on profile type
if ($profileType === 'basic') {
    return [
        'user' => [
            'id' => $user['_id'],
            'name' => $user['name']
        ]
    ];
}

return ['user' => $user];
```

### Multiple Path Segments

Create `config/api/files/[...all].php` for handling any path under `/api/files/`:

```php
<?php

// $API_ARGS contains all path segments after /api/files/
$path = implode('/', $API_ARGS);

// Example: /api/files/images/thumbnails/pic.jpg
// $API_ARGS = ['images', 'thumbnails', 'pic.jpg']
// $path = 'images/thumbnails/pic.jpg'

$filePath = $this->path('#uploads:') . '/' . $path;

if (!file_exists($filePath)) {
    $this->response->status = 404;
    return ['error' => 'File not found'];
}

return [
    'file' => $path,
    'size' => filesize($filePath),
    'modified' => filemtime($filePath),
    'url' => $this->fileStorage->getURL("uploads://{$path}")
];
```

## Working with Request Data

### Reading Request Body

```php
<?php

// Get request method
$method = $this->request->method;

// Get request body (JSON/form data)
$data = $this->request->body;

// Get query parameters
$page = $this->param('page', 1);
$limit = $this->param('limit', 10);

// Get headers
$contentType = $this->request->server['CONTENT_TYPE'] ?? '';
$userAgent = $this->request->server['HTTP_USER_AGENT'] ?? '';

return [
    'method' => $method,
    'data' => $data,
    'params' => [
        'page' => $page,
        'limit' => $limit
    ]
];
```

### File Uploads

Create `config/api/upload.post.php`:

```php
<?php

if (!isset($_FILES['file'])) {
    $this->response->status = 400;
    return ['error' => 'No file uploaded'];
}

// Use Cockpit's asset system
$assets = $this->module('assets');

try {
    $asset = $assets->upload($_FILES['file'], [
        'title' => $this->param('title', 'Uploaded file'),
        'folder' => $this->param('folder', '/uploads')
    ]);
    
    return [
        'success' => true,
        'asset' => $asset
    ];
    
} catch (Exception $e) {
    $this->response->status = 500;
    return ['error' => $e->getMessage()];
}
```

## Authentication and Authorization

### Checking API Access

```php
<?php

// Get current API user
$user = $this->helper('auth')->getUser();

// Check if user is authenticated
if (!$user || $user['user'] === 'anonymous') {
    $this->response->status = 401;
    return ['error' => 'Authentication required'];
}

// Check user role
if ($user['role'] !== 'admin') {
    $this->response->status = 403;
    return ['error' => 'Admin access required'];
}

// Protected functionality
return [
    'message' => 'Welcome, admin!',
    'user' => $user['user']
];
```

### Custom API Key Validation

```php
<?php

$apiKey = $this->request->server['HTTP_X_API_KEY'] ?? null;

if (!$apiKey) {
    $this->response->status = 401;
    return ['error' => 'API key required'];
}

// Validate against custom API keys
$validKeys = ['secret-key-1', 'secret-key-2'];

if (!in_array($apiKey, $validKeys)) {
    $this->response->status = 403;
    return ['error' => 'Invalid API key'];
}

// API key is valid
return ['message' => 'Access granted'];
```

## Error Handling

### Standard Error Responses

```php
<?php

try {
    // Your API logic here
    $result = $this->module('content')->items('posts');
    
    return [
        'success' => true,
        'data' => $result
    ];
    
} catch (Exception $e) {
    
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Return appropriate error response
    $this->response->status = 500;
    return [
        'success' => false,
        'error' => 'Internal server error',
        'message' => $this->retrieve('debug') ? $e->getMessage() : 'Something went wrong'
    ];
}
```


## Advanced Examples

### RESTful Resource API

Create a complete RESTful API for managing products:

**config/api/products.get.php**:
```php
<?php

$page = (int)$this->param('page', 1);
$limit = (int)$this->param('limit', 20);
$skip = ($page - 1) * $limit;

$filter = [];
$category = $this->param('category');
if ($category) {
    $filter['category'] = $category;
}

$products = $this->module('content')->items('products', [
    'filter' => $filter,
    'limit' => $limit,
    'skip' => $skip,
    'sort' => ['_created' => -1]
]);

$total = $this->module('content')->count('products', $filter);

return [
    'products' => $products,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'pages' => ceil($total / $limit)
    ]
];
```

**config/api/products/[...all].get.php**:
```php
<?php

$productId = $API_ARGS[0] ?? null;

if (!$productId) {
    $this->response->status = 400;
    return ['error' => 'Product ID is required'];
}

$product = $this->module('content')->item('products', ['_id' => $productId]);

if (!$product) {
    $this->response->status = 404;
    return ['error' => 'Product not found'];
}

return ['product' => $product];
```

**config/api/products/[...all].put.php**:
```php
<?php

$productId = $API_ARGS[0] ?? null;
$data = $this->request->body;

if (!$productId) {
    $this->response->status = 400;
    return ['error' => 'Product ID is required'];
}

// Check if product exists
$product = $this->module('content')->item('products', ['_id' => $productId]);

if (!$product) {
    $this->response->status = 404;
    return ['error' => 'Product not found'];
}

// Update product
$data['_id'] = $productId;
$updatedProduct = $this->module('content')->saveItem('products', $data);

return [
    'success' => true,
    'product' => $updatedProduct
];
```

### Search API with Filters

**config/api/search.php**:
```php
<?php

$query = $this->param('q', '');
$type = $this->param('type', 'all');
$limit = (int)$this->param('limit', 10);

if (empty($query)) {
    $this->response->status = 400;
    return ['error' => 'Search query is required'];
}

$results = [];

// Search in different content types
$searchModels = $type === 'all' ? ['posts', 'products', 'pages'] : [$type];

foreach ($searchModels as $model) {
    
    $items = $this->module('content')->items($model, [
        'filter' => [
            '$or' => [
                ['title' => ['$regex' => $query, '$options' => 'i']],
                ['content' => ['$regex' => $query, '$options' => 'i']]
            ]
        ],
        'limit' => $limit,
        'fields' => ['_id', 'title', 'content', '_created']
    ]);
    
    foreach ($items as $item) {
        $item['_type'] = $model;
        $results[] = $item;
    }
}

// Sort by relevance/date
usort($results, function($a, $b) {
    return $b['_created'] - $a['_created'];
});

return [
    'query' => $query,
    'results' => array_slice($results, 0, $limit),
    'total' => count($results)
];
```

## Best Practices

### 1. Use Consistent Response Format

```php
<?php

// Success response
return [
    'success' => true,
    'data' => $result,
    'message' => 'Operation completed successfully'
];

// Error response
$this->response->status = 400;
return [
    'success' => false,
    'error' => 'validation_failed',
    'message' => 'Invalid input data',
    'details' => $validationErrors
];
```

### 2. Implement Rate Limiting

```php
<?php

$rateLimiter = $this->helper('apiRateLimiter');
$clientIp = $this->request->getClientIp();

if (!$rateLimiter->isAllowed($clientIp, 'api', 100, 3600)) { // 100 requests per hour
    $this->response->status = 429;
    return ['error' => 'Rate limit exceeded'];
}

// Continue with API logic...
```

### 3. Add API Versioning

Organize your APIs by version:

```
config/
`-- api/
    |-- v1/
    |   |-- users.php
    |   `-- products.php
    `-- v2/
        |-- users.php
        `-- products.php
```

Access: `/api/v1/users` or `/api/v2/users`

### 4. Document Your APIs

Add comments and validation:

```php
<?php

/**
 * Get user profile
 * 
 * @param string $id User ID
 * @return array User profile data
 * 
 * @example GET /api/user/123
 */

$userId = $API_ARGS[0] ?? null;

if (!$userId) {
    $this->response->status = 400;
    return [
        'error' => 'user_id_required',
        'message' => 'User ID is required in the URL path'
    ];
}

// Implementation...
```

## Testing Your APIs

### Using cURL

```bash
# GET request
curl -X GET "http://localhost:8080/api/users" \
  -H "api-key: your-api-key"

# POST request with JSON
curl -X POST "http://localhost:8080/api/users" \
  -H "Content-Type: application/json" \
  -H "api-key: your-api-key" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# File upload
curl -X POST "http://localhost:8080/api/upload" \
  -H "api-key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "title=My Image"
```

### Using JavaScript

```javascript
// GET request
fetch('/api/users', {
    headers: {
        'api-key': 'your-api-key'
    }
})
.then(response => response.json())
.then(data => console.log(data));

// POST request
fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'api-key': 'your-api-key'
    },
    body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Troubleshooting

### Common Issues

1. **404 Not Found**: Check file path matches URL structure
2. **500 Internal Error**: Check PHP syntax and error logs
3. **Authentication Failed**: Verify API key is correct and has proper permissions
4. **Empty Response**: Ensure your endpoint file returns data

### Debug Mode

Enable debug mode to see detailed error messages:

```php
// In your API endpoint
if ($this->retrieve('debug')) {
    error_log("API Debug: " . print_r($data, true));
}
```

## Next Steps

- Explore Cockpit's built-in content and asset APIs for inspiration
- Consider implementing API caching for performance
- Add comprehensive error handling and logging
- Create API documentation for your team
- Implement automated testing for your endpoints

File-based API endpoints provide a simple yet powerful way to extend Cockpit's capabilities with custom functionality while maintaining clean separation of concerns.