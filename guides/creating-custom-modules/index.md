# Creating Custom Addons

Learn how to create custom addons to extend Cockpit CMS functionality.

[[toc]]

## Overview

Cockpit CMS allows you to extend its functionality through custom addons. Addons are feature-rich extensions that can provide specific functionality, integrate with external services, and include their own dependencies.

## Basic Addon Structure

### Directory Structure

```
YourAddon/
|-- bootstrap.php        # Addon initialization
|-- admin.php           # Admin interface setup (optional)
|-- api.php            # API endpoints (optional)  
|-- icon.svg           # Addon icon
|-- Controller/        # Controllers directory
|   `-- YourAddon.php # Main controller
|-- Helper/           # Helper classes (optional)
|   `-- YourAddon.php
|-- assets/           # Frontend assets (optional)
|   |-- js/
|   |-- css/
|   `-- vue-components/
`-- views/            # View templates (optional)
    `-- index.php
```

### Required Files

#### 1. bootstrap.php

The `bootstrap.php` file is the entry point for your addon. It handles initialization and registers event listeners:

```php
<?php

// Load admin interface when admin is initialized
$this->on('app.admin.init', function() {
    include(__DIR__.'/admin.php');
});

// Extend the addon with custom methods
$this->module('youraddon')->extend([
    
    'config' => function(?string $key = null, $default = null) {
        $config = array_replace_recursive([
            'enabled' => true,
            'option1' => 'default_value',
            'option2' => null
        ], $this->app->retrieve('youraddon', []) ?? []);
        
        return $key ? ($config[$key] ?? $default) : $config;
    },
    
    'isEnabled' => function() {
        return $this->config('enabled', true);
    },
    
    'customMethod' => function($param) {
        // Your custom functionality
        return $param;
    }
]);
```

#### 2. admin.php (Optional)

The `admin.php` file sets up the admin interface integration:

```php
<?php

// Only load for users with appropriate permissions
if ($this->helper('acl')->hasPermission('youraddon/manage')) {
    
    // Bind controller to routes
    $this->bindClass('YourAddon\\Controller\\YourAddon', '/youraddon');
    
    // Add to settings menu
    $this->on('app.settings.collect', function($settings) {
        $settings['Extensions'][] = [
            'icon' => 'youraddon:icon.svg',
            'route' => '/youraddon',
            'label' => 'Your Addon',
            'permission' => 'youraddon/manage'
        ];
    });
}
```

#### 3. Controller/YourModule.php

The main controller handles HTTP requests:

```php
<?php

namespace YourModule\Controller;

use App\Controller\Base;

class YourModule extends Base {

    protected $layout = 'app:layouts/app.php';
    
    public function before() {
        // Check permissions
        if (!$this->helper('acl')->hasPermission('youraddon/manage')) {
            $this->stop(401);
        }
    }
    
    public function index() {
        return $this->render('youraddon:views/index.php', [
            'config' => $this->module('youraddon')->config()
        ]);
    }
    
    public function save() {
        // Handle form submissions
        $data = $this->app->request->body;
        
        // Validate and save configuration
        $this->app->storage->setKey('youraddon', $data);
        
        return ['success' => true];
    }
}
```

## Addon Location

Addons should be placed in `/cockpit/addons/YourAddon/`

Addons can include:
- External dependencies via Composer
- Custom helpers and services
- Complex initialization patterns
- Integration with external APIs

## Configuration

### Addon Configuration

Addons can read configuration from the main Cockpit configuration:

```php
// In config/config.php
'youraddon' => [
    'enabled' => true,
    'api_endpoint' => 'https://api.example.com',
    'timeout' => 30
]
```

### Access Configuration in Addon

```php
// In bootstrap.php
$this->module('youraddon')->extend([
    'config' => function(?string $key = null, $default = null) {
        $config = array_replace_recursive([
            'enabled' => true,
            'api_endpoint' => null,
            'timeout' => 30
        ], $this->app->retrieve('youraddon', []) ?? []);
        
        return $key ? ($config[$key] ?? $default) : $config;
    }
]);
```

## Events and Hooks

Cockpit provides various events you can hook into:

```php
// Application events
$this->on('app.admin.init', function() {
    // Admin interface initialization
});

$this->on('app.layout.init', function() {
    // Layout initialization - add theme variables
    $this->helper('theme')->vars('customVar', 'value');
});

// Content events
$this->on('content.save.before', function($name, &$data) {
    // Modify data before saving
});

$this->on('content.save.after', function($name, $data) {
    // React to content being saved
});

// User events
$this->on('app.user.login', function($user) {
    // User logged in
});
```

## Assets and Frontend Integration

### Asset Structure

```
assets/
|-- js/
|   `-- youraddon.js
|-- css/
|   `-- youraddon.css
|-- vue-components/
|   `-- your-component.js
`-- dialogs/
    `-- your-dialog.js
```

### Loading Assets

```php
// In admin.php or views
$this->script([
    'youraddon:assets/js/youraddon.js'
], 'youraddon');

$this->style([
    'youraddon:assets/css/youraddon.css'
], 'youraddon');
```

## Permissions

Define custom permissions for your addon:

```php
// In admin.php
$this->helper('acl')->addPermissions([
    'youraddon' => [
        'manage' => 'Manage Your Addon',
        'view' => 'View Your Addon Data',
        'edit' => 'Edit Your Addon Settings'
    ]
]);
```

## API Endpoints

Create REST API endpoints for your addon:

#### api.php
```php
<?php

// API routes
$this->bindClass('YourAddon\\Controller\\Api', '/api/youraddon');

// Helper method for API access
$this->module('youraddon')->extend([
    'getApiData' => function($params = []) {
        // Return API data
        return [];
    }
]);
```

#### Controller/Api.php
```php
<?php

namespace YourAddon\Controller;

use App\Controller\Base;

class Api extends Base {
    
    public function data() {
        // Return JSON data
        return $this->module('youraddon')->getApiData(
            $this->app->request->query
        );
    }
}
```

## Best Practices

### 1. Namespace Your Code
Always use proper namespaces to avoid conflicts:

```php
namespace YourAddon\Controller;
namespace YourAddon\Helper;
```

### 2. Check Permissions
Always verify user permissions:

```php
if (!$this->helper('acl')->hasPermission('youraddon/manage')) {
    $this->stop(401);
}
```

### 3. Handle Configuration Gracefully
Provide sensible defaults and validation:

```php
'config' => function(?string $key = null, $default = null) {
    $config = array_replace_recursive([
        // Sensible defaults
        'enabled' => true,
        'timeout' => 30
    ], $this->app->retrieve('yourmodule', []) ?? []);
    
    return $key ? ($config[$key] ?? $default) : $config;
}
```

### 4. Use Proper Error Handling
Handle errors gracefully:

```php
try {
    // Your code
} catch (Exception $e) {
    $this->app->trigger('error', ['error' => $e->getMessage()]);
    return ['error' => 'Operation failed'];
}
```

## Next Steps

- Review addon implementations in `/cockpit/addons/` for advanced patterns
- Check the Cockpit documentation for available helpers and APIs
- Test your addon thoroughly with different user permissions
- Consider using Composer for external dependencies

This guide covers the basic setup for creating custom addons. The modular architecture of Cockpit allows for extensive customization while maintaining clean separation of concerns.