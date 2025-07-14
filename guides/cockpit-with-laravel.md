# Using Cockpit with Laravel

Learn how to integrate Cockpit CMS as a headless content management system for your Laravel applications.

[[toc]]

## Overview

Cockpit CMS provides an excellent headless CMS solution that integrates seamlessly with Laravel. This guide covers:

- Setting up a Laravel service provider for Cockpit
- Creating a fluent API client with caching
- Building Blade components for content rendering
- Implementing content synchronization
- Creating custom Artisan commands
- Building RESTful APIs with Cockpit data

## Project Setup

### Prerequisites

- PHP 8.1+ with required extensions
- Laravel 10+ installed
- Cockpit CMS instance running
- Composer for dependency management

### Installation

Create a new Laravel project or use an existing one:

```bash
composer create-project laravel/laravel my-cockpit-app
cd my-cockpit-app
```

### Environment Configuration

Add Cockpit configuration to your `.env` file:

```bash
# Cockpit Configuration
COCKPIT_API_URL=http://localhost:8080/api
COCKPIT_API_KEY=your-api-key-here
COCKPIT_CACHE_TTL=3600
```

## Creating the Cockpit Service

### Service Provider

Create `app/Providers/CockpitServiceProvider.php`:

```php
<?php

namespace App\Providers;

use App\Services\CockpitService;
use Illuminate\Support\ServiceProvider;

class CockpitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CockpitService::class, function ($app) {
            return new CockpitService(
                config('services.cockpit.api_url'),
                config('services.cockpit.api_key'),
                config('services.cockpit.cache_ttl', 3600)
            );
        });

        $this->app->alias(CockpitService::class, 'cockpit');
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../../config/cockpit.php' => config_path('cockpit.php'),
        ], 'cockpit-config');
    }
}
```

### Configuration File

Create `config/cockpit.php`:

```php
<?php

return [
    'api_url' => env('COCKPIT_API_URL', 'http://localhost:8080/api'),
    'api_key' => env('COCKPIT_API_KEY'),
    'cache_ttl' => env('COCKPIT_CACHE_TTL', 3600),
    'cache_prefix' => 'cockpit_',
    'timeout' => 30,
];
```

Update `config/services.php`:

```php
'cockpit' => [
    'api_url' => env('COCKPIT_API_URL'),
    'api_key' => env('COCKPIT_API_KEY'),
    'cache_ttl' => env('COCKPIT_CACHE_TTL', 3600),
],
```

### Cockpit Service Class

Create `app/Services/CockpitService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;

class CockpitService
{
    protected string $apiUrl;
    protected string $apiKey;
    protected int $cacheTtl;
    protected PendingRequest $client;

    public function __construct(string $apiUrl, string $apiKey, int $cacheTtl = 3600)
    {
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->apiKey = $apiKey;
        $this->cacheTtl = $cacheTtl;

        $this->client = Http::withHeaders([
            'api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(config('cockpit.timeout', 30));
    }

    /**
     * Get collection items
     */
    public function getItems(string $collection, array $options = []): Collection
    {
        $cacheKey = $this->getCacheKey('items', $collection, $options);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($collection, $options) {
            $response = $this->client->get("{$this->apiUrl}/content/items/{$collection}", $options);

            if (!$response->successful()) {
                throw new \Exception("Failed to fetch items from collection: {$collection}");
            }

            return collect($response->json());
        });
    }

    /**
     * Get single item by ID
     */
    public function getItem(string $collection, string $id, bool $useCache = true): ?array
    {
        if (!$useCache) {
            return $this->fetchItem($collection, $id);
        }

        $cacheKey = $this->getCacheKey('item', $collection, ['id' => $id]);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($collection, $id) {
            return $this->fetchItem($collection, $id);
        });
    }

    /**
     * Get singleton content
     */
    public function getSingleton(string $singleton, bool $useCache = true): ?array
    {
        if (!$useCache) {
            return $this->fetchSingleton($singleton);
        }

        $cacheKey = $this->getCacheKey('singleton', $singleton);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($singleton) {
            return $this->fetchSingleton($singleton);
        });
    }


    /**
     * Clear cache for specific content
     */
    public function clearCache(?string $type = null, ?string $name = null): void
    {
        if ($type === null) {
            Cache::flush();
            return;
        }

        $pattern = config('cockpit.cache_prefix') . "{$type}:{$name}:*";
        Cache::forget($pattern);
    }

    /**
     * Get asset URL
     */
    public function getAssetUrl(string $assetId, array $params = []): string
    {
        $baseUrl = str_replace('/api', '', $this->apiUrl);
        $query = http_build_query($params);

        return "{$baseUrl}/api/assets/image/{$assetId}" . ($query ? "?{$query}" : '');
    }

    protected function fetchItem(string $collection, string $id): ?array
    {
        $response = $this->client->get("{$this->apiUrl}/content/item/{$collection}/{$id}");

        if (!$response->successful()) {
            return null;
        }

        return $response->json();
    }

    protected function fetchSingleton(string $singleton): ?array
    {
        $response = $this->client->get("{$this->apiUrl}/content/item/{$singleton}");

        if (!$response->successful()) {
            return null;
        }

        return $response->json();
    }

    protected function getCacheKey(string $type, string $name, array $params = []): string
    {
        $prefix = config('cockpit.cache_prefix', 'cockpit_');
        $paramKey = md5(json_encode($params));

        return "{$prefix}{$type}:{$name}:{$paramKey}";
    }

    public function getClient(): PendingRequest
    {
        return $this->client;
    }
}
```


## Laravel Integration

### Facade

Create `app/Facades/Cockpit.php`:

```php
<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class Cockpit extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cockpit';
    }
}
```

Register the facade in `config/app.php`:

```php
'aliases' => Facade::defaultAliases()->merge([
    'Cockpit' => App\Facades\Cockpit::class,
])->toArray(),
```

### Blade Components

Create `app/View/Components/CockpitImage.php`:

```php
<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class CockpitImage extends Component
{
    public ?string $src;

    public function __construct(
        public ?array $asset,
        public ?int $width = null,
        public ?int $height = null,
        public int $quality = 80,
        public ?string $alt = null,
        public ?string $class = null,
    ) {
        $this->src = $this->generateUrl();
    }

    public function render(): View|Closure|string
    {
        if (!$this->src) {
            return '';
        }

        return view('components.cockpit-image');
    }

    protected function generateUrl(): ?string
    {
        if (!$this->asset || !isset($this->asset['_id'])) {
            return null;
        }

        $params = [];

        if ($this->width) $params['w'] = $this->width;
        if ($this->height) $params['h'] = $this->height;
        if ($this->quality) $params['q'] = $this->quality;

        return app('cockpit')->getAssetUrl($this->asset['_id'], $params);
    }
}
```

Create `resources/views/components/cockpit-image.blade.php`:

```html
<img
    src="{{ $src }}"
    alt="{{ $alt ?? $asset['title'] ?? '' }}"
    @if($width) width="{{ $width }}" @endif
    @if($height) height="{{ $height }}" @endif
    @if($class) class="{{ $class }}" @endif
    {{ $attributes }}
>
```

### Content Models

Create model classes for your Cockpit content:

```php
<?php

namespace App\Models\Cockpit;

use Illuminate\Support\Facades\Cockpit;

abstract class CockpitModel
{
    protected static string $collection = '';
    protected array $attributes = [];

    public function __construct(array $attributes = [])
    {
        $this->attributes = $attributes;
    }

    public static function find(string $id): ?static
    {
        $data = Cockpit::getItem(static::$collection, $id);

        return $data ? new static($data) : null;
    }

    public static function all(): \Illuminate\Support\Collection
    {
        return Cockpit::getItems(static::$collection)->map(fn($item) => new static($item));
    }

    public function __get($key)
    {
        return $this->attributes[$key] ?? null;
    }

    public function __set($key, $value)
    {
        $this->attributes[$key] = $value;
    }

    public function toArray(): array
    {
        return $this->attributes;
    }
}
```

Create `app/Models/Cockpit/Post.php`:

```php
<?php

namespace App\Models\Cockpit;

use Carbon\Carbon;

class Post extends CockpitModel
{
    protected static string $collection = 'posts';

    public function getPublishedAtAttribute(): Carbon
    {
        return Carbon::createFromTimestamp($this->_created);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->featured_image) {
            return null;
        }

        return app('cockpit')->getAssetUrl($this->featured_image['_id'], [
            'w' => 800,
            'h' => 400,
            'q' => 80
        ]);
    }

    public static function published(): \Illuminate\Support\Collection
    {
        return Cockpit::getItems(static::$collection, [
            'filter' => ['published' => true]
        ])->map(fn($item) => new static($item));
    }

    public static function findBySlug(string $slug): ?static
    {
        $items = Cockpit::getItems(static::$collection, [
            'filter' => [
                'slug' => $slug,
                'published' => true
            ],
            'limit' => 1
        ]);

        $post = $items->first();
        return $post ? new static($post) : null;
    }
}
```

## Building a Blog Example

### Routes

Update `routes/web.php`:

```php
<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/search', [BlogController::class, 'search'])->name('blog.search');
```

### Controllers

Create `app/Http/Controllers/BlogController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cockpit\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cockpit;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = 12;
        $skip = ($page - 1) * $perPage;

        $posts = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => $perPage,
            'skip' => $skip
        ])->map(fn($post) => new Post($post));

        // For pagination, you'd need to get the total count
        // This is a simplified version
        $total = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'fields' => ['_id' => 1]
        ])->count();

        return view('blog.index', [
            'posts' => $posts,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage)
            ]
        ]);
    }

    public function show(string $slug)
    {
        $post = Post::findBySlug($slug);

        if (!$post) {
            abort(404);
        }

        return view('blog.show', compact('post'));
    }

    public function search(Request $request)
    {
        $query = $request->get('q');

        if (!$query) {
            return redirect()->route('blog.index');
        }

        $posts = Cockpit::getItems('posts', [
            'filter' => [
                '$and' => [
                    ['published' => true],
                    ['$or' => [
                        ['title' => ['$regex' => $query, '$options' => 'i']],
                        ['content' => ['$regex' => $query, '$options' => 'i']],
                        ['excerpt' => ['$regex' => $query, '$options' => 'i']]
                    ]]
                ]
            ],
            'sort' => ['_created' => -1],
            'limit' => 20
        ])->map(fn($post) => new Post($post));

        return view('blog.search', compact('posts', 'query'));
    }
}
```

Create `app/Http/Controllers/PageController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cockpit\Post;
use Illuminate\Support\Facades\Cockpit;

class PageController extends Controller
{
    public function home()
    {
        $settings = Cockpit::getSingleton('site_settings');

        $posts = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => 6
        ])->map(fn($post) => new Post($post));

        return view('home', compact('settings', 'posts'));
    }
}
```

### Views

Create `resources/views/layouts/app.blade.php`:

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name'))</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <a href="{{ route('home') }}" class="flex items-center">
                        {{ config('app.name') }}
                    </a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="{{ route('blog.index') }}">Blog</a>
                    <form action="{{ route('blog.search') }}" method="GET" class="flex">
                        <input type="search" name="q" placeholder="Search..."
                               value="{{ request('q') }}"
                               class="px-3 py-1 border rounded-l">
                        <button type="submit" class="px-4 py-1 bg-blue-500 text-white rounded-r">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <main class="py-8">
        @yield('content')
    </main>
</body>
</html>
```

Create `resources/views/blog/index.blade.php`:

```html
@extends('layouts.app')

@section('title', 'Blog')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold mb-8">Blog</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($posts as $post)
            <article class="bg-white rounded-lg shadow overflow-hidden">
                @if($post->featured_image)
                    <x-cockpit-image
                        :asset="$post->featured_image"
                        :width="400"
                        :height="200"
                        class="w-full h-48 object-cover"
                    />
                @endif

                <div class="p-6">
                    <h2 class="text-xl font-semibold mb-2">
                        <a href="{{ route('blog.show', $post->slug) }}"
                           class="hover:text-blue-600">
                            {{ $post->title }}
                        </a>
                    </h2>

                    <p class="text-gray-600 mb-4">{{ $post->excerpt }}</p>

                    <div class="text-sm text-gray-500">
                        <span>By {{ $post->author }}</span>
                        <time class="ml-2">{{ $post->published_at->format('M d, Y') }}</time>
                    </div>
                </div>
            </article>
        @endforeach
    </div>

    {{-- Simple pagination --}}
    @if($pagination['last_page'] > 1)
        <div class="mt-8 flex justify-center space-x-2">
            @for($i = 1; $i <= $pagination['last_page']; $i++)
                <a href="?page={{ $i }}"
                   class="px-3 py-1 {{ $i == $pagination['current_page'] ? 'bg-blue-500 text-white' : 'bg-gray-200' }} rounded">
                    {{ $i }}
                </a>
            @endfor
        </div>
    @endif
</div>
@endsection
```

Create `resources/views/blog/show.blade.php`:

```html
@extends('layouts.app')

@section('title', $post->title)

@section('content')
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{{ $post->title }}</h1>

        @if($post->featured_image)
            <x-cockpit-image
                :asset="$post->featured_image"
                :width="800"
                :height="400"
                class="w-full rounded-lg mb-6"
            />
        @endif

        <div class="text-gray-600">
            <span>By {{ $post->author }}</span>
            <time class="ml-4">{{ $post->published_at->format('F d, Y') }}</time>
        </div>
    </header>

    <div class="prose prose-lg max-w-none">
        {!! $post->content !!}
    </div>

    @if($post->tags)
        <footer class="mt-8 pt-8 border-t">
            <div class="flex flex-wrap gap-2">
                @foreach($post->tags as $tag)
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {{ $tag }}
                    </span>
                @endforeach
            </div>
        </footer>
    @endif
</article>
@endsection
```

## Artisan Commands

Create custom commands for content management:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cockpit;

class CockpitCacheClear extends Command
{
    protected $signature = 'cockpit:cache-clear {type?} {name?}';
    protected $description = 'Clear Cockpit cache';

    public function handle(): int
    {
        $type = $this->argument('type');
        $name = $this->argument('name');

        Cockpit::clearCache($type, $name);

        $this->info('Cockpit cache cleared successfully.');

        return Command::SUCCESS;
    }
}
```

```php
<?php

namespace App\Console\Commands;

use App\Models\Cockpit\Post;
use Illuminate\Console\Command;

class CockpitImportPosts extends Command
{
    protected $signature = 'cockpit:import-posts {--published}';
    protected $description = 'Import posts from Cockpit CMS';

    public function handle(): int
    {
        $filter = [];

        if ($this->option('published')) {
            $filter['published'] = true;
        }

        $posts = Cockpit::getItems('posts', [
            'filter' => $filter
        ])->map(fn($post) => new Post($post));

        $this->info("Found {$posts->count()} posts");

        // Process posts as needed
        foreach ($posts as $post) {
            $this->line("- {$post->title}");
        }

        return Command::SUCCESS;
    }
}
```

## API Development

Create API endpoints that serve Cockpit content:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cockpit\Post;
use Illuminate\Http\Request;

class PostApiController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);
        $skip = ($page - 1) * $perPage;

        $posts = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => $perPage,
            'skip' => $skip
        ]);

        $total = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'fields' => ['_id' => 1]
        ])->count();

        return response()->json([
            'data' => $posts->map(fn($post) => [
                'id' => $post['_id'],
                'title' => $post['title'],
                'slug' => $post['slug'],
                'excerpt' => $post['excerpt'],
                'author' => $post['author'],
                'published_at' => $post['_created'],
                'image_url' => $post['featured_image']
                    ? app('cockpit')->getAssetUrl($post['featured_image']['_id'])
                    : null,
            ]),
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
            ]
        ]);
    }

    public function show(string $slug)
    {
        $post = Post::findBySlug($slug);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $post->_id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'author' => $post->author,
                'tags' => $post->tags,
                'published_at' => $post->_created,
                'image_url' => $post->image_url,
            ]
        ]);
    }
}
```

## Caching Strategies

### Cache Warming

Create a scheduled job to warm the cache:

```php
<?php

namespace App\Jobs;

use App\Models\Cockpit\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class WarmCockpitCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Warm posts cache
        Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => 100
        ]);

        // Warm individual post cache
        $recentPosts = Cockpit::getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => 20,
            'fields' => ['_id' => 1, 'slug' => 1]
        ]);

        foreach ($recentPosts as $post) {
            Post::find($post['_id']);
        }
    }
}
```

Schedule in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule): void
{
    $schedule->job(new WarmCockpitCache)->hourly();
}
```

## Testing

Create tests for your Cockpit integration:

```php
<?php

namespace Tests\Feature;

use App\Services\CockpitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CockpitServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Mock Cockpit API responses
        Http::fake([
            '*/api/content/items/posts*' => Http::response([
                ['_id' => '1', 'title' => 'Test Post', 'slug' => 'test-post'],
            ]),
            '*/api/content/item/posts/1' => Http::response([
                '_id' => '1',
                'title' => 'Test Post',
                'slug' => 'test-post',
                'content' => 'Test content',
            ]),
        ]);
    }

    public function test_can_fetch_collection_items()
    {
        $service = app(CockpitService::class);
        $items = $service->getItems('posts');

        $this->assertCount(1, $items);
        $this->assertEquals('Test Post', $items[0]['title']);
    }

    public function test_can_fetch_single_item()
    {
        $service = app(CockpitService::class);
        $item = $service->getItem('posts', '1');

        $this->assertNotNull($item);
        $this->assertEquals('Test Post', $item['title']);
    }

    public function test_filter_options_work()
    {
        $service = app(CockpitService::class);
        $items = $service->getItems('posts', [
            'filter' => ['published' => true],
            'sort' => ['_created' => -1],
            'limit' => 10
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $items);
    }
}
```

## Best Practices

### 1. Error Handling

Always handle API failures gracefully:

```php
try {
    $posts = Post::published()->get();
} catch (\Exception $e) {
    Log::error('Failed to fetch posts from Cockpit', [
        'error' => $e->getMessage()
    ]);

    // Return cached or default data
    $posts = collect();
}
```

### 2. Performance Optimization

Use field selection and caching:

```php
// Only fetch required fields
$posts = Cockpit::getItems('posts', [
    'fields' => ['_id' => 1, 'title' => 1, 'slug' => 1, 'excerpt' => 1, '_created' => 1],
    'limit' => 10
]);

// Cache expensive queries
$popularPosts = Cache::remember('popular_posts', 3600, function () {
    return Cockpit::getItems('posts', [
        'filter' => [
            'published' => true,
            'views' => ['$gt' => 1000]
        ],
        'sort' => ['views' => -1],
        'limit' => 5
    ]);
});
```

### 3. Configuration Management

Use config files for all Cockpit settings:

```php
// config/cockpit.php
return [
    'collections' => [
        'posts' => [
            'cache_ttl' => 3600,
            'per_page' => 12,
        ],
        'pages' => [
            'cache_ttl' => 7200,
            'per_page' => 20,
        ],
    ],
];
```

## Deployment

### Environment Variables

Set these in your production `.env`:

```bash
COCKPIT_API_URL=https://your-cockpit-instance.com/api
COCKPIT_API_KEY=your-production-api-key
COCKPIT_CACHE_TTL=7200
```

### Cache Configuration

Optimize cache for production:

```php
// Use Redis for better performance
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify API URL and key in `.env`
   - Check network connectivity
   - Ensure Cockpit instance is accessible

2. **Cache Issues**
   - Clear Laravel cache: `php artisan cache:clear`
   - Clear Cockpit cache: `php artisan cockpit:cache-clear`

3. **Performance Issues**
   - Enable query caching
   - Use field selection to reduce payload
   - Implement pagination for large datasets

This integration provides a robust foundation for using Cockpit CMS with Laravel, leveraging Laravel's powerful features while maintaining the flexibility of a headless CMS.