# Built-in Tools

Autopilot comes with several AI-callable tools that enable it to interact with your Cockpit installation.

[[toc]]

## createContentModel

Creates new content models (collections, singletons, trees).

### Capabilities

- Define field structure with proper types
- Set up complex fields (sets, assets, relations)
- Configure field options (required, multiple, i18n)
- Organize models into groups

### Example Prompts

```
"Create a team members collection with name, role, bio, photo, and social links"

"Set up a singleton called 'Site Settings' with logo, site name, and footer text"

"Create a FAQ tree with question and answer fields"
```

### What It Creates

The tool automatically:
- Generates appropriate field types based on descriptions
- Sets up proper field configurations
- Creates the model with sensible defaults

## createLayoutComponent

Creates custom layout components for the visual page builder.

### Capabilities

- Define component fields
- Set up component structure
- Configure component options

### Example Prompts

```
"Create a testimonial component with quote, author name, author photo, and company"

"Make a hero section component with headline, subheadline, background image, and CTA button"

"Create a feature grid component with icon, title, and description fields"
```

## getSystemInfo

Retrieves information about your Cockpit installation.

### Capabilities

- PHP version and configuration
- Installed addons and their status
- Database configuration
- Storage information

### Example Prompts

```
"What addons are installed?"

"Show me system information"

"What PHP version is running?"

"What database is being used?"
```

## getCockpitHelp

Provides contextual help about Cockpit features.

### Example Prompts

```
"How do webhooks work?"

"Explain content model types"

"What field types are available?"

"How do I set up localization?"

"How do I configure API access?"
```

## Tool Permissions

Each tool requires specific permissions:

| Tool | Required Permission |
|------|---------------------|
| createContentModel | `autopilot/tools/write` |
| createLayoutComponent | `autopilot/tools/write` |
| getSystemInfo | `autopilot/tools/read` |
| getCockpitHelp | `autopilot/tools/read` |

Users without the required permissions cannot use those tools.
