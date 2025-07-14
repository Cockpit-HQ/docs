# CLI

Cockpit provides a powerful command line interface to automate tasks, manage content, and maintain your installation.

[[toc]]

## Overview

The Cockpit CLI tool `tower` enables developers to perform various administrative and maintenance tasks from the command line. This is particularly useful for automation, deployment scripts, and bulk operations.

## Usage

Navigate to your Cockpit root directory and run commands using:

```bash
./tower [command] [arguments] [options]
```

To see all available commands:

```bash
./tower list
```

For help with a specific command:

```bash
./tower help [command]
```

## Available Commands

### System Commands

#### app:cache:flush

Clears all cached data by emptying the `/storage/tmp` folder.

```bash
./tower app:cache:flush
```

**Use cases:**
- After configuration changes
- When troubleshooting issues
- As part of deployment process

#### app:i18n:create

Creates translation files for Cockpit's admin interface for a specific locale.

```bash
# Create translation for German
./tower app:i18n:create de

# Create translation for French, only for System module
./tower app:i18n:create fr System
```

**Arguments:**
- `locale` (required): Target language code (e.g., de, fr, es)
- `module` (optional): Create language file for a specific module only

**Features:**
- Scans PHP and JS files for translatable strings
- Creates files in `config/i18n/{locale}/{module}.php`
- Can auto-translate using Lokalize addon if available

#### app:spaces:create

Creates a new application space in the `/.spaces` folder for multi-tenant setups.

```bash
./tower app:spaces:create clientname
```

**Arguments:**
- `name` (required): Name of the new space

**Learn more:** [Spaces documentation](/documentation/core/concepts/spaces)

### Worker/Queue Commands

#### app:worker:start

Starts a background worker process to handle queued jobs.

```bash
./tower app:worker:start
```

**Features:**
- Runs continuously processing jobs
- Handles signals for graceful shutdown
- Tracks worker PID for management

#### app:worker:stop

Stops running worker processes.

```bash
# Stop all workers gracefully
./tower app:worker:stop

# Stop specific worker by PID
./tower app:worker:stop 12345

# Force stop all workers
./tower app:worker:stop --force
```

**Arguments:**
- `pid` (optional): Specific worker PID to stop

**Options:**
- `--force` or `-f`: Force kill workers (SIGKILL instead of SIGTERM)

#### app:worker:list

Lists all active worker processes.

```bash
# Show active workers
./tower app:worker:list

# Show all workers including inactive
./tower app:worker:list --all

# Show only CLI workers
./tower app:worker:list --mode cli
```

**Options:**
- `--all` or `-a`: Show all workers including inactive ones
- `--mode` or `-m`: Filter by mode (cli or web)

**Output includes:**
- Process ID (PID)
- Mode (cli/web)
- Start time
- Uptime
- Status

### Content Commands

#### content:field:remove

Removes a field from all items in a content model.

```bash
./tower content:field:remove posts legacy_field
```

**Arguments:**
- `model` (required): Target model name
- `field` (required): Field name to remove

**Works with:** Collections, Trees, and Singletons

::: Note
This operation is irreversible. Always backup your data first.
:::

#### content:field:rename

Renames a field across all items in a content model.

```bash
./tower content:field:rename posts old_title new_title
```

**Arguments:**
- `model` (required): Target model name
- `currentname` (required): Current field name
- `newname` (required): New field name

**Works with:** Collections, Trees, and Singletons

#### content:index:create

Creates a database index for improved query performance.

```bash
# Create compound index on title (ascending) and date (descending)
./tower content:index:create posts '{"title": 1, "date": -1}'

# Create text index for search
./tower content:index:create posts '{"$**": "text"}'
```

**Arguments:**
- `model` (required): Target model name
- `config` (required): Index configuration in JSON format
- `options` (optional): Additional index options in JSON format

**Works with:** Collections and Trees only

#### content:index:remove

Removes an index from a content model.

```bash
./tower content:index:remove posts title_1_date_-1
```

**Arguments:**
- `model` (required): Target model name
- `index` (required): Index name to remove

#### content:index:list

Lists all indexes for a content model.

```bash
./tower content:index:list posts
```

**Arguments:**
- `model` (required): Target model name

### Assets Commands

#### assets:thumbhash:generate

Generates thumb hashes for all image assets for improved loading performance.

```bash
./tower assets:thumbhash:generate
```

**Features:**
- Processes images in batches
- Shows progress bar
- Skips SVG files and already processed images
- Creates compact representations for lazy loading

#### assets:files:fixvisibility

Ensures all asset files have correct public permissions.

```bash
./tower assets:files:fixvisibility
```

**Features:**
- Processes all assets in batches
- Shows progress bar
- Fixes file permissions for web access

### Updater Commands

#### app:update

Updates Cockpit to the latest version.

```bash
# Update to latest Core version
./tower app:update

# Update to latest Pro version
./tower app:update pro

# Update to specific Core version
./tower app:update core 2.5.0
```

**Arguments:**
- `target` (optional): Release target - 'core' or 'pro' (default: core)
- `version` (optional): Specific version (default: latest)

::: Note
Always backup your installation before updating.
:::

## Command Options

Most commands support these global options:

- `-h, --help`: Display help for the command
- `-q, --quiet`: Suppress output messages
- `-v, --verbose`: Increase verbosity (use -vv or -vvv for more detail)
- `--no-interaction`: Run without interactive prompts

## Best Practices

1. **Use in Scripts**: Integrate CLI commands in deployment scripts for automated workflows
2. **Cron Jobs**: Use worker commands with system cron for reliable job processing
3. **Maintenance Mode**: Combine commands for maintenance tasks (cache flush, index rebuild, etc.)
4. **Logging**: Use verbose mode (-v) to debug issues
5. **Backup First**: Always backup before running data-modifying commands

## Examples

### Deployment Script

```bash
#!/bin/bash
# Update Cockpit and clear caches
./tower app:update
./tower app:cache:flush
./tower assets:thumbhash:generate
```

### Maintenance Script

```bash
#!/bin/bash
# Maintenance tasks
./tower app:cache:flush
./tower content:index:list posts
./tower assets:files:fixvisibility
```

### Worker Management

```bash
# Start worker in background
nohup ./tower app:worker:start > /dev/null 2>&1 &

# Check worker status
./tower app:worker:list

# Graceful restart
./tower app:worker:stop
sleep 5
./tower app:worker:start
```