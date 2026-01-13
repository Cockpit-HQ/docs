# Custom Tools

Extend Autopilot with your own AI-callable tools for custom workflows.

[[toc]]

## Overview

Custom tools allow you to extend Autopilot's capabilities to perform actions specific to your project. Tools are defined using JSON Schema for parameters and can execute any PHP code.

## Tool File Structure

Create PHP files in `/config/agent-tools/`:

```php
<?php
// /config/agent-tools/sendNotification.php

return [
    'name' => 'sendNotification',
    'description' => 'Send a notification to specified users',
    'parameters' => [
        'type' => 'object',
        'properties' => [
            'message' => [
                'type' => 'string',
                'description' => 'The notification message'
            ],
            'users' => [
                'type' => 'array',
                'description' => 'List of usernames to notify',
                'items' => ['type' => 'string']
            ]
        ],
        'required' => ['message', 'users']
    ],
    'handler' => function($args, $app) {
        // Your tool logic here
        $message = $args['message'];
        $users = $args['users'];

        // Send notifications...

        return [
            'success' => true,
            'message' => "Notified " . count($users) . " users"
        ];
    },
    'options' => [
        'permission' => 'autopilot/tools/write'
    ]
];
```

## Registering Tools Programmatically

Register tools via the event system in your addon's bootstrap:

```php
$this->on('autopilot:agent:register', function($agent) {

    $agent->registerTool(
        'myCustomTool',
        'Description of what the tool does',
        [
            'type' => 'object',
            'properties' => [
                'param1' => ['type' => 'string', 'description' => 'First parameter']
            ],
            'required' => ['param1']
        ],
        function($args, $app) {
            // Tool implementation
            return ['result' => 'success'];
        },
        ['permission' => 'mycustom/permission']
    );
});
```

## Tool Parameters Schema

Tools use JSON Schema for parameter validation:

```php
'parameters' => [
    'type' => 'object',
    'properties' => [
        'name' => [
            'type' => 'string',
            'description' => 'Human-readable description for the AI'
        ],
        'count' => [
            'type' => 'integer',
            'description' => 'Number of items',
            'default' => 10
        ],
        'type' => [
            'type' => 'string',
            'enum' => ['option1', 'option2', 'option3'],
            'description' => 'Must be one of the allowed values'
        ],
        'tags' => [
            'type' => 'array',
            'items' => ['type' => 'string'],
            'description' => 'List of tags'
        ]
    ],
    'required' => ['name']
]
```

## Parameter Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"Hello World"` |
| `integer` | Whole number | `42` |
| `number` | Any number | `3.14` |
| `boolean` | True/false | `true` |
| `array` | List of items | `["a", "b", "c"]` |
| `object` | Key-value pairs | `{"key": "value"}` |

## Example Tools

### Search Content

```php
<?php
// /config/agent-tools/searchContent.php

return [
    'name' => 'searchContent',
    'description' => 'Search for content items across all collections',
    'parameters' => [
        'type' => 'object',
        'properties' => [
            'query' => [
                'type' => 'string',
                'description' => 'Search query'
            ],
            'collection' => [
                'type' => 'string',
                'description' => 'Optional: limit to specific collection'
            ]
        ],
        'required' => ['query']
    ],
    'handler' => function($args, $app) {
        $results = [];
        $collections = $app->module('content')->collections();

        foreach ($collections as $name => $model) {
            if (isset($args['collection']) && $args['collection'] !== $name) {
                continue;
            }

            $items = $app->dataStorage->find("content/collections/{$name}", [
                'filter' => [
                    '$or' => [
                        ['title' => ['$regex' => $args['query'], '$options' => 'i']],
                        ['name' => ['$regex' => $args['query'], '$options' => 'i']]
                    ]
                ],
                'limit' => 10
            ])->toArray();

            $results[$name] = $items;
        }

        return ['results' => $results];
    },
    'options' => [
        'permission' => 'autopilot/tools/read'
    ]
];
```

### Publish Content

```php
<?php
// /config/agent-tools/publishContent.php

return [
    'name' => 'publishContent',
    'description' => 'Publish a content item by ID',
    'parameters' => [
        'type' => 'object',
        'properties' => [
            'collection' => [
                'type' => 'string',
                'description' => 'Collection name'
            ],
            'id' => [
                'type' => 'string',
                'description' => 'Item ID to publish'
            ]
        ],
        'required' => ['collection', 'id']
    ],
    'handler' => function($args, $app) {
        $item = $app->dataStorage->findOne(
            "content/collections/{$args['collection']}",
            ['_id' => $args['id']]
        );

        if (!$item) {
            return ['error' => 'Item not found'];
        }

        $item['_state'] = 1;
        $app->dataStorage->save("content/collections/{$args['collection']}", $item);

        return [
            'success' => true,
            'message' => "Published item {$args['id']}"
        ];
    },
    'options' => [
        'permission' => 'autopilot/tools/write'
    ]
];
```

### Generate Report

```php
<?php
// /config/agent-tools/generateReport.php

return [
    'name' => 'generateReport',
    'description' => 'Generate a content statistics report',
    'parameters' => [
        'type' => 'object',
        'properties' => [
            'type' => [
                'type' => 'string',
                'enum' => ['summary', 'detailed'],
                'description' => 'Report type'
            ]
        ],
        'required' => ['type']
    ],
    'handler' => function($args, $app) {
        $report = [];
        $collections = $app->module('content')->collections();

        foreach ($collections as $name => $model) {
            $count = $app->dataStorage->count("content/collections/{$name}");
            $published = $app->dataStorage->count("content/collections/{$name}", [
                '_state' => 1
            ]);

            $report[$name] = [
                'total' => $count,
                'published' => $published,
                'draft' => $count - $published
            ];
        }

        return ['report' => $report];
    },
    'options' => [
        'permission' => 'autopilot/tools/read'
    ]
];
```

## Best Practices

### Clear Descriptions
Write clear descriptions that help the AI understand when to use the tool:

```php
// Good
'description' => 'Search for blog posts by title or content. Use when the user wants to find specific articles.'

// Bad
'description' => 'Search function'
```

### Permission Scoping
Always specify appropriate permissions:

```php
'options' => [
    'permission' => 'autopilot/tools/read'  // For read-only tools
    // or
    'permission' => 'autopilot/tools/write' // For tools that modify data
]
```

### Error Handling
Return meaningful error messages:

```php
'handler' => function($args, $app) {
    try {
        // Tool logic
        return ['success' => true, 'data' => $result];
    } catch (\Exception $e) {
        return ['error' => $e->getMessage()];
    }
}
```

### Return Useful Data
Return structured data the AI can interpret:

```php
return [
    'success' => true,
    'count' => count($items),
    'items' => $items,
    'message' => "Found " . count($items) . " items"
];
```
