# Installation

[[toc]]

## Setup

The following steps describe the setup of a fresh new installation of Cockpit.

1. [Download](https://getcockpit.com/start-journey) the latest version of Cockpit
2. Extract the archive
3. Deploy files to your webserver's root directory (or any sub-folder)
4. Navigate to your Cockpit installation folder at **/install/**
5. Ensure write permissions for the **/storage** directory.
6. Open the administration panel
7. Login with username **admin** and generated password
8. Congratulations! You managed to install Cockpit successfully.

::: Note
To make the installation process as simple as possible, Cockpit creates a default admin account. Please change the password after your first login.
:::

## Docker

Run Cockpit in containers for consistent, scalable deployments across any environment.

### Quick Start

Pull and run Cockpit with persistent storage:

```bash
# Run with SQLite (recommended for development)
docker run -d \
  --name cockpit \
  -p 8080:80 \
  -v cockpit_storage:/var/www/html/storage \
  cockpithq/cockpit:latest

# Access at http://localhost:8080/install
```

### Available Docker Tags

- `core-latest` - Latest stable core release
- `core-{version}` - Specific core version (e.g., `core-3.0.0`)
- `pro-latest` - Latest stable pro release
- `pro-{version}` - Specific pro version

Visit [Docker Hub](https://hub.docker.com/r/cockpithq/cockpit/tags) for all available tags.

### Production Setup with MongoDB

For production environments, we recommend using MongoDB for better performance and scalability:

```yaml
# docker-compose.yml
version: '3.8'
services:
  cockpit:
    image: cockpithq/cockpit:core-latest
    ports:
      - "80:80"
    environment:
      - COCKPIT_DATABASE_SERVER=mongodb://mongo:27017
      - COCKPIT_DATABASE_NAME=cockpit
    volumes:
      - ./storage:/var/www/html/storage
      - ./config:/var/www/html/config
    depends_on:
      - mongo
      
  mongo:
    image: mongo:8
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=cockpit

volumes:
  mongo_data:
```

### Configuration

Create a `config/config.php` file to configure your Cockpit instance:

```php
<?php
// config/config.php
return [
    'database' => [
        'server' => $_ENV['COCKPIT_DATABASE_SERVER'] ?? 'mongodb://mongo:27017',
        'database' => $_ENV['COCKPIT_DATABASE_NAME'] ?? 'cockpit'
    ],
    'sec-key' => $_ENV['COCKPIT_SEC_KEY'] ?? 'your-random-security-key'
];
```

### Mounting Configuration

You can mount your configuration in two ways:

**Option 1: Via Docker Compose volumes**
```yaml
volumes:
  - ./config:/var/www/html/config
  - ./storage:/var/www/html/storage
```

**Option 2: Create custom Docker image**
```dockerfile
FROM cockpithq/cockpit:core-latest
COPY ./config/config.php /var/www/html/config/config.php
```

### Persistent Storage

Always mount volumes for data persistence:

- `/var/www/html/storage` - User uploads, cache, and database (SQLite)
- `/var/www/html/config` - Configuration files
- `/var/www/html/.spaces` - Multi-tenant spaces (if using)

::: Note
When using Docker, ensure the mounted directories have proper permissions. The container runs as `www-data` user.
:::


---

## Troubleshooting

### Cockpit displays a blank page

If you see a blank page we recommend checking your server logs. Next make sure you display PHP error messages. In most cases you should see some errors where the blank page was displayed before.

### Cockpit does not save changes correctly

If changes to your content, content-models, settings or anything else you administer in Cockpit's admin panel get lost, please check the directory write permissions for your Cockpit installation as described in [Setup](#setup).
