# Autopilot

Autopilot is an AI-powered assistant addon for Cockpit CMS that provides a conversational interface to help content authors and developers work more efficiently. It supports any AI service that implements the OpenAI REST API, giving you the flexibility to use cloud providers like OpenAI, Groq, Together AI, or self-hosted solutions like Ollama.

[[toc]]

## Features

- **AI Chat Assistant** - Conversational interface accessible from any page in the admin
- **Any OpenAI-Compatible Provider** - Works with OpenAI, Azure, Groq, Mistral, Ollama, and more
- **Content Model Creation** - Create collections, singletons, and trees through natural language
- **Layout Component Creation** - Design custom layout components by describing what you need
- **System Information** - Query your Cockpit setup and configuration
- **Contextual Help** - Get help with Cockpit features and best practices
- **Extensible Tools** - Add custom AI tools for your specific workflows
- **Permission-Based Access** - Control which users can access AI capabilities

## Using the Assistant

Once configured, a chat icon appears in the admin header. Click it to open the AI assistant dialog.

### Example Conversations

**Creating a Blog:**
```
You: Create a blog posts collection with title, slug, content, featured image, and author
AI: I'll create that content model for you...
    ✓ Created "blogposts" collection with 5 fields
```

**Setting Up an E-commerce Catalog:**
```
You: I need a products collection with name, description, price, SKU, images gallery,
     and a category reference
AI: I'll set up the products collection...
    ✓ Created "products" collection with the specified fields
```

**Creating Layout Components:**
```
You: Create a hero component with headline, subheadline, background image, and CTA button
AI: I'll create that layout component...
    ✓ Created "hero" layout component
```

**Getting Help:**
```
You: How do I set up localization for my content?
AI: To enable localization in Cockpit:
    1. Go to Settings > Locales
    2. Add your target languages
    3. Enable i18n on specific fields in your content models...
```

## Use Cases

### Content Team Onboarding
New team members can ask the AI how to perform tasks:
- "How do I create a new blog post?"
- "Where can I upload images?"
- "How do I preview my changes?"

### Rapid Prototyping
Quickly scaffold content models for new projects:
- "Create a portfolio with projects, each having title, description, images, and technologies used"
- "Set up an events calendar with date, location, description, and registration link"

### Developer Productivity
Get help with Cockpit development:
- "What field types are available?"
- "How do I create a custom field type?"
- "Explain the content API filtering syntax"

### Content Modeling Assistance
Get recommendations for structuring content:
- "I'm building a recipe website, what content models do I need?"
- "How should I structure a multi-language FAQ section?"

## Best Practices

### Be Specific
More detail helps the AI create better models:
```
❌ "Create a products collection"
✓ "Create a products collection with name, slug, description (rich text),
   price (number), images (multiple assets), and category (relation to categories)"
```

### Review Before Publishing
The AI creates draft structures - review field types and options before using in production.

### Use Groups
Ask for organized models:
```
"Create a settings singleton in the 'Configuration' group with site name,
logo, and social media links"
```

### Iterate
Refine your models through conversation:
```
You: Create a blog posts collection
AI: Created blogposts with title, content, created date
You: Add a featured image field and author relation
AI: Added featured_image (asset) and author (contentItemLink) fields
```

## Permissions

Control Autopilot access through Cockpit's permission system:

| Permission | Description |
|------------|-------------|
| `autopilot/available` | Can access the AI assistant |
| `autopilot/tools/read` | Can use read-only tools (list, search, view) |
| `autopilot/tools/write` | Can use write tools (create, update) |
| `autopilot/tools/delete` | Can use delete tools |
| `autopilot/tools/admin` | Can use admin tools (system config) |

Configure in **Settings > Roles & Permissions**.

## Troubleshooting

### AI Not Appearing
- Verify API key is correctly configured
- Check browser console for errors
- Ensure user has `autopilot/available` permission

### Tool Execution Fails
- Check user has required tool permissions
- Review Cockpit logs for error details
- Verify tool parameters match schema

### Slow Responses
- Consider using a faster model or provider (e.g., Groq for speed)
- Check your AI provider's API quota and rate limits
- Simplify complex requests into smaller steps
- For local models, ensure adequate hardware resources

### Model Creation Issues
- Model names must be alphanumeric (no spaces/hyphens)
- Check if model name already exists
- Verify user has content model management permissions
