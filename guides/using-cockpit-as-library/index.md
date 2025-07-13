# Using Cockpit as a Library

Learn how to integrate Cockpit CMS as a library into your existing PHP applications.

[[toc]]

## Overview

Cockpit CMS can be used as a library within your existing PHP applications, providing powerful content management capabilities without requiring a full Cockpit installation. This approach allows you to leverage Cockpit's content models, APIs, and data storage while maintaining your application's existing architecture.

## Basic Setup

### Directory Structure

To use Cockpit as a library, you need to include the Cockpit bootstrap and create an instance:

```
your-project/
|-- cockpit/                 # Cockpit CMS installation
|   |-- bootstrap.php        # Cockpit bootstrap file
|   |-- modules/             # Core modules
|   `-- addons/              # Additional addons
|-- config/
|   `-- config.php           # Your Cockpit configuration
|-- storage/                 # Data storage directory
|   |-- data/                # Database files
|   |-- cache/               # Cache files
|   `-- uploads/             # Uploaded assets
`-- your-app.php             # Your application
```

### Basic Integration

```php
<?php

// Include Cockpit bootstrap
include(__DIR__.'/cockpit/bootstrap.php');

// Get Cockpit instance
$cockpit = Cockpit::instance();

// Now you can use Cockpit services
$content = $cockpit->module('content');
$assets = $cockpit->module('assets');
```

## Instance Creation

### Using the Factory Method

The `Cockpit::instance()` method is the recommended way to create a Cockpit instance:

```php
<?php

include(__DIR__.'/cockpit/bootstrap.php');

// Basic instance (uses current directory for config)
$cockpit = Cockpit::instance();

// Custom environment directory  
$cockpit = Cockpit::instance('/path/to/custom-cockpit-env');

// With custom configuration
$cockpit = Cockpit::instance(null, [
    'debug' => true,
    'app.name' => 'My Custom App',
    'database' => [
        'server' => 'mongodb://localhost:27017',
        'options' => ['db' => 'my_custom_db']
    ]
]);
```



## Working with Content

### Content Models

```php
<?php

$content = $cockpit->module('content');

// Create a content model
$model = [
    'name' => 'posts',
    'type' => 'collection',
    'fields' => [
        [
            'name' => 'title',
            'type' => 'text',
            'opts' => ['required' => true]
        ],
        [
            'name' => 'content',
            'type' => 'wysiwyg'
        ],
        [
            'name' => 'published',
            'type' => 'boolean',
            'opts' => ['default' => false]
        ]
    ]
];

$content->createModel('posts', $model);
```

### Content Operations

```php
<?php

// Save content items
$post = [
    'title' => 'My First Post',
    'content' => '<p>This is the content of my post.</p>',
    'published' => true
];

$savedPost = $content->saveItem('posts', $post);

// Retrieve content
$posts = $content->items('posts', [
    'filter' => ['published' => true],
    'sort' => ['_created' => -1],
    'limit' => 10
]);

// Get single item
$post = $content->item('posts', ['_id' => $savedPost['_id']]);

// Update content
$post['title'] = 'Updated Title';
$content->saveItem('posts', $post);

// Delete content
$content->remove('posts', ['_id' => $post['_id']]);
```

### Working with Singletons

```php
<?php

// Create singleton model
$settingsModel = [
    'name' => 'site_settings',
    'type' => 'singleton',
    'fields' => [
        [
            'name' => 'site_title',
            'type' => 'text'
        ],
        [
            'name' => 'maintenance_mode',
            'type' => 'boolean'
        ]
    ]
];

$content->createModel('site_settings', $settingsModel);

// Save singleton data
$settings = [
    'site_title' => 'My Website',
    'maintenance_mode' => false
];

$content->saveItem('site_settings', $settings);

// Retrieve singleton data
$siteSettings = $content->item('site_settings');
```

## Working with Assets

### Asset Management

```php
<?php

$assets = $cockpit->module('assets');

// Upload and save asset
$assetData = [
    'title' => 'My Image',
    'description' => 'A sample image',
    'tags' => ['sample', 'image']
];

// If you have a file upload
if (isset($_FILES['image'])) {
    $asset = $assets->upload($_FILES['image'], $assetData);
}

// Get assets
$images = $assets->find([
    'filter' => ['mime' => ['$regex' => '^image']],
    'sort' => ['_created' => -1]
]);

// Get single asset
$asset = $assets->findOne(['_id' => $assetId]);
```

## Database Operations

### Direct Database Access

```php
<?php

$db = $cockpit->dataStorage;

// Insert document
$user = [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'active' => true,
    '_created' => time()
];

$db->save('users', $user);

// Find documents
$users = $db->find('users', [
    'filter' => ['active' => true],
    'sort' => ['name' => 1]
])->toArray();

// Update document
$db->update('users', ['_id' => $user['_id']], ['$set' => ['active' => false]]);

// Remove documents
$db->remove('users', ['active' => false]);
```

### Using Memory Storage

```php
<?php

$memory = $cockpit->memory;

// Set/get cache values
$memory->set('cache_key', $data, 3600); // TTL in seconds
$cachedData = $memory->get('cache_key');

// Check if key exists
if ($memory->exists('cache_key')) {
    // Key exists
}

// Delete key
$memory->del('cache_key');
```

## Event System

### Listening to Events

```php
<?php

// Listen for content save events
$cockpit->on('content.item.save', function($modelName, $item, $isUpdate) {
    if ($modelName === 'posts' && !$isUpdate) {
        // New post created, send notification
        error_log("New post created: {$item['title']}");
    }
});

// Listen for user login events
$cockpit->on('app.user.login', function($user) {
    error_log("User {$user['email']} logged in");
});

// Custom events
$cockpit->on('my.custom.event', function($data) {
    // Handle custom event
});

// Trigger custom events
$cockpit->trigger('my.custom.event', [$someData]);
```

## Helper Methods

### Using Built-in Helpers

```php
<?php

// Validation helper
$validator = $cockpit->helper('validator');
$isValid = $validator->isEmail('test@example.com');

// Utils helper
$utils = $cockpit->helper('utils');
$truncated = $utils->truncate($longText, 100);

// Cache helper
$cache = $cockpit->helper('cache');
$cache->write('key', $data, 3600);
$cachedData = $cache->read('key');

// Session helper (if sessions are enabled)
$session = $cockpit->helper('session');
$session->write('user_id', 123);
$userId = $session->read('user_id');
```

## Integration Examples

### Simple Blog Integration

```php
<?php

include(__DIR__.'/cockpit/bootstrap.php');

class BlogService {
    
    private $cockpit;
    private $content;
    
    public function __construct() {
        $this->cockpit = Cockpit::instance();
        $this->content = $this->cockpit->module('content');
    }
    
    public function getPublishedPosts($limit = 10, $offset = 0) {
        return $this->content->items('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => $limit,
            'skip' => $offset
        ]);
    }
    
    public function getPost($id) {
        return $this->content->item('posts', ['_id' => $id]);
    }
    
    public function createPost($data) {
        return $this->content->saveItem('posts', $data);
    }
    
    public function updatePost($id, $data) {
        $data['_id'] = $id;
        return $this->content->saveItem('posts', $data);
    }
}

// Usage
$blog = new BlogService();
$posts = $blog->getPublishedPosts();
```

### API Wrapper

```php
<?php

include(__DIR__.'/cockpit/bootstrap.php');

class ContentAPI {
    
    private $cockpit;
    
    public function __construct() {
        $this->cockpit = Cockpit::instance();
    }
    
    public function handleRequest() {
        
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $segments = explode('/', trim($path, '/'));
        
        // Route: /api/content/{model}
        if (count($segments) >= 3 && $segments[0] === 'api' && $segments[1] === 'content') {
            
            $model = $segments[2];
            $content = $this->cockpit->module('content');
            
            switch ($method) {
                case 'GET':
                    $items = $content->items($model);
                    $this->jsonResponse($items);
                    break;
                    
                case 'POST':
                    $data = json_decode(file_get_contents('php://input'), true);
                    $item = $content->saveItem($model, $data);
                    $this->jsonResponse($item);
                    break;
                    
                default:
                    $this->jsonResponse(['error' => 'Method not allowed'], 405);
            }
        } else {
            $this->jsonResponse(['error' => 'Not found'], 404);
        }
    }
    
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}

// Usage
$api = new ContentAPI();
$api->handleRequest();
```

## Best Practices

### 1. Environment Separation

```php
<?php

// Different configs for different environments
$environment = $_ENV['APP_ENV'] ?? 'production';

$config = include(__DIR__."/config/{$environment}.php");
$cockpit = Cockpit::instance(null, $config);
```

### 2. Error Handling

```php
<?php

$cockpit = Cockpit::instance();

// Set up error handling
$cockpit->on('error', function($error, $exception) {
    error_log("Cockpit Error: {$error['message']} in {$error['file']}:{$error['line']}");
});

try {
    $content = $cockpit->module('content');
    $posts = $content->items('posts');
} catch (Exception $e) {
    error_log("Error fetching posts: " . $e->getMessage());
    $posts = [];
}
```

### 3. Performance Optimization

```php
<?php

// Use caching for expensive operations
$cache = $cockpit->helper('cache');

$cacheKey = 'popular_posts';
$posts = $cache->read($cacheKey);

if (!$posts) {
    $posts = $cockpit->module('content')->items('posts', [
        'filter' => ['featured' => true],
        'sort' => ['views' => -1],
        'limit' => 5
    ]);
    
    $cache->write($cacheKey, $posts, 3600); // Cache for 1 hour
}
```

### 4. Security Considerations

```php
<?php

// Validate and sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

$postData = sanitizeInput($_POST);

// Use proper authentication
$user = $cockpit->helper('auth')->getUser();
if (!$user) {
    http_response_code(401);
    exit('Unauthorized');
}
```

## Troubleshooting

### Common Issues

1. **Permissions**: Ensure the storage directory is writable
```bash
chmod -R 755 storage/
```

2. **Module not found**: Check module paths in configuration
```php
'paths' => [
    '#modules' => __DIR__.'/cockpit/modules',
    '#addons' => __DIR__.'/cockpit/addons'
]
```

3. **Database connection**: Verify database configuration
```php
'database' => [
    'server' => "mongolite://{__DIR__}/storage/data",
    'options' => ['db' => 'app']
]
```

### Debug Mode

Enable debug mode for development:

```php
$cockpit = Cockpit::instance(null, [
    'debug' => true
]);
```

## Next Steps

- Review the Cockpit API documentation for advanced features
- Explore existing modules and addons for additional functionality
- Consider creating custom modules for specific business logic
- Set up proper logging and monitoring for production use

Using Cockpit as a library provides a powerful, flexible foundation for content-driven applications while maintaining full control over your application architecture.