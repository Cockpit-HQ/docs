# Guides

Welcome to the Cockpit CMS guides section. These guides provide step-by-step instructions and best practices for extending and customizing Cockpit.

## Development Guides

### [Creating Custom Addons](/documentation/guides/creating-custom-modules)

Learn how to create custom addons to extend Cockpit's functionality. This guide covers:
- Basic addon structure and required files
- Registering routes and controllers
- Creating admin interfaces
- Working with events and hooks
- Best practices for addon development

### [Creating Custom Fields](/documentation/guides/creating-custom-fields)

Discover how to build custom field types for your content models. This guide includes:
- Vue.js component structure for fields
- Field metadata and settings configuration
- Handling user input and data persistence
- Creating complex interactive fields
- Integration with Cockpit's UI components

### [Using Cockpit as Library](/documentation/guides/using-cockpit-as-library)

Integrate Cockpit CMS into your existing PHP applications. Learn about:
- Including Cockpit bootstrap and creating instances
- Working with content models and data
- Using Cockpit's database and file storage
- Event system integration
- Building custom services on top of Cockpit

### [File-Based API Endpoints](/documentation/guides/creating-file-based-api-endpoints)

Create custom REST API endpoints using Cockpit's file-based routing. This guide covers:
- File-based API routing system
- HTTP method-specific endpoints
- Dynamic routes with catch-all patterns
- Authentication and authorization
- Building RESTful APIs

## Integration Guides

### [Cockpit with Next.js](/documentation/guides/cockpit-with-nextjs)

Build modern React applications using Cockpit as a headless CMS backend. This comprehensive guide covers:
- Setting up Cockpit API client for Next.js
- Implementing static generation and server-side rendering
- Dynamic routing and content fetching
- Image optimization and performance
- Webhook integration for content updates
- TypeScript support and best practices

### [Cockpit with Nuxt.js](/documentation/guides/cockpit-with-nuxtjs)

Create performant Vue.js applications with Cockpit CMS and Nuxt.js. This guide includes:
- Building a Nuxt.js API client with composables
- Server-side rendering (SSR) and static generation
- Dynamic pages with Nuxt Content patterns
- Performance optimization with caching
- Real-time content updates via webhooks
- Vue.js reactivity and TypeScript integration

### [Cockpit with Laravel](/documentation/guides/cockpit-with-laravel)

Integrate Cockpit CMS seamlessly with Laravel applications. This comprehensive guide covers:
- Creating a Laravel service provider and facade for Cockpit
- Direct MongoDB-style queries with filter arrays
- Implementing Blade components for content rendering
- Content model abstraction with Eloquent-like syntax
- Caching strategies and performance optimization
- Creating custom Artisan commands for content management

### [Cockpit with Remix](/documentation/guides/cockpit-with-remix)

Build full-stack React applications with Remix and Cockpit CMS. This guide includes:
- Setting up server-side Cockpit API client
- Data fetching with loaders and actions
- Optimistic UI updates and streaming
- Form handling with progressive enhancement
- Image optimization and CDN integration
- Error boundaries and type-safe development

## Getting Started

Choose a guide based on what you want to accomplish:

- **Want to add new features?** Start with [Creating Custom Addons](/documentation/guides/creating-custom-modules)
- **Need specialized input fields?** Check out [Creating Custom Fields](/documentation/guides/creating-custom-fields)
- **Building a custom application?** Read [Using Cockpit as Library](/documentation/guides/using-cockpit-as-library)
- **Creating APIs?** Explore [File-Based API Endpoints](/documentation/guides/creating-file-based-api-endpoints)
- **Building with Next.js?** Follow [Cockpit with Next.js](/documentation/guides/cockpit-with-nextjs)
- **Building with Nuxt.js?** Check out [Cockpit with Nuxt.js](/documentation/guides/cockpit-with-nuxtjs)
- **Building with Laravel?** Read [Cockpit with Laravel](/documentation/guides/cockpit-with-laravel)
- **Building with Remix?** Explore [Cockpit with Remix](/documentation/guides/cockpit-with-remix)

## Prerequisites

Before diving into these guides, make sure you have:

- Basic knowledge of PHP and JavaScript
- Familiarity with Cockpit's core concepts
- A working Cockpit installation
- Development environment set up

## Contributing

These guides are part of the Cockpit documentation. If you find any issues or have suggestions for improvements, please contribute to the documentation.

## Additional Resources

- [Core Documentation](/documentation/core) - Learn about Cockpit's core features
- [API Reference](/documentation/core/api) - Detailed API documentation
- [Pro Addons](/documentation/pro) - Documentation for premium addons