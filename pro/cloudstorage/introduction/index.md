# CloudStorage

The CloudStorage addon enables seamless integration with cloud storage providers for managing digital assets. Store and serve your files from Amazon S3, Azure Blob Storage, or any S3-compatible service.

[[toc]]

## Overview

CloudStorage replaces Cockpit's default local file storage with cloud-based solutions, enabling:

- **Scalable Storage**: No local disk limitations
- **Global CDN**: Faster asset delivery worldwide
- **High Availability**: Cloud provider redundancy
- **Cost Efficiency**: Pay only for what you use

## Supported Providers

| Provider | Status |
|----------|--------|
| Amazon S3 | Fully Supported |
| S3-Compatible Services | Fully Supported |
| Azure Blob Storage | Fully Supported |
| Google Cloud Storage | Planned |

:::info
Amazon S3, Azure Blob Storage, and services with S3-compatible APIs (MinIO, DigitalOcean Spaces, Backblaze B2, Cloudflare R2, etc.) are supported.
:::

## Installation

### Azure Blob Storage Dependency

Azure Blob Storage requires an additional Flysystem adapter:

```bash
composer require azure-oss/storage-blob-flysystem
```

:::warning
Azure Blob Storage will **not work** without this package. The addon will throw an exception if you try to use Azure without installing this dependency first.
:::

AWS S3 dependencies are included with Cockpit CMS by default - no additional installation required.

## Configuration

### Amazon S3

Add to `/config/config.php`:

```php
<?php

return [
    'cloudStorage' => [
        'uploads' => [
            'key' => getenv('S3_KEY'),
            'secret' => getenv('S3_SECRET'),
            'region' => 'eu-central-1',
            'bucket' => getenv('S3_BUCKET')
        ]
    ]
];
```

Set in your `.env` file:

```
S3_KEY=your-access-key-id
S3_SECRET=your-secret-access-key
S3_BUCKET=your-bucket-name
```

### S3-Compatible Services

For S3-compatible services like MinIO, DigitalOcean Spaces, or Cloudflare R2, add the `url` parameter:

```php
<?php

return [
    'cloudStorage' => [
        'uploads' => [
            'url' => getenv('S3_URL'),
            'key' => getenv('S3_KEY'),
            'secret' => getenv('S3_SECRET'),
            'region' => getenv('S3_REGION') ?? 'auto',
            'bucket' => getenv('S3_BUCKET')
        ]
    ]
];
```

### Azure Blob Storage

Add to `/config/config.php`:

```php
<?php

return [
    'cloudStorage' => [
        'uploads' => [
            'type' => 'azure',
            'account' => getenv('AZURE_STORAGE_ACCOUNT'),
            'key' => getenv('AZURE_STORAGE_KEY'),
            'container' => getenv('AZURE_CONTAINER'),
            'prefix' => 'uploads/',              // Optional: file prefix
            'url' => getenv('AZURE_CDN_URL')     // Optional: custom CDN URL
        ]
    ]
];
```

Set in your `.env` file:

```
AZURE_STORAGE_ACCOUNT=mystorageaccount
AZURE_STORAGE_KEY=your-storage-account-key
AZURE_CONTAINER=uploads
AZURE_CDN_URL=https://cdn.example.com
```

#### Alternative: Connection String

You can also use an Azure connection string:

```php
<?php

return [
    'cloudStorage' => [
        'uploads' => [
            'type' => 'azure',
            'connectionString' => getenv('AZURE_CONNECTION_STRING'),
            'container' => getenv('AZURE_CONTAINER'),
            'prefix' => 'uploads/'
        ]
    ]
];
```

### Provider-Specific Examples

#### DigitalOcean Spaces

```
S3_URL=https://nyc3.digitaloceanspaces.com
S3_KEY=your-spaces-key
S3_SECRET=your-spaces-secret
S3_REGION=nyc3
S3_BUCKET=your-space-name
```

#### Cloudflare R2

```
S3_URL=https://your-account-id.r2.cloudflarestorage.com
S3_KEY=your-r2-access-key
S3_SECRET=your-r2-secret-key
S3_REGION=auto
S3_BUCKET=your-bucket-name
```

#### MinIO (Self-Hosted)

```
S3_URL=http://localhost:9000
S3_KEY=minioadmin
S3_SECRET=minioadmin
S3_REGION=us-east-1
S3_BUCKET=cockpit-assets
```

#### Backblaze B2

```
S3_URL=https://s3.us-west-004.backblazeb2.com
S3_KEY=your-application-key-id
S3_SECRET=your-application-key
S3_REGION=us-west-004
S3_BUCKET=your-bucket-name
```

## Configuration Options

### S3 / S3-Compatible Options

| Option | Description | Required |
|--------|-------------|----------|
| `type` | Set to `s3` (optional for S3, required if using Azure) | No |
| `url` | Custom S3 endpoint URL | Only for S3-compatible services |
| `key` | Access key ID | Yes |
| `secret` | Secret access key | Yes |
| `region` | AWS region or service region | Yes |
| `bucket` | Bucket name | Yes |
| `prefix` | File prefix/folder path | No |
| `visibility` | Default file visibility (`public` or `private`) | No |

### Azure Blob Storage Options

| Option | Description | Required |
|--------|-------------|----------|
| `type` | Must be set to `azure` | Yes |
| `account` | Storage account name | Yes (unless using connectionString) |
| `key` | Storage account key | Yes (unless using connectionString) |
| `connectionString` | Full Azure connection string | Alternative to account/key |
| `container` | Blob container name | Yes |
| `prefix` | File prefix/folder path | No |
| `url` | Custom CDN URL for file access | No |

## How It Works

Once configured, CloudStorage automatically:

1. **Uploads**: New assets are stored directly in your cloud bucket
2. **Retrieval**: Assets are served from the cloud storage URL
3. **Management**: All asset operations (delete, rename) work seamlessly

The Assets manager in Cockpit continues to work as expected - the only change is where files are physically stored.

## Best Practices

### Security

- Never commit credentials to version control
- Use environment variables for all sensitive data
- Create IAM users with minimal required permissions
- Enable bucket versioning for accidental deletion protection

### Performance

- Choose a region close to your primary user base
- Consider using a CDN in front of your bucket for global distribution
- Enable transfer acceleration if available

### S3 Bucket Policy Example (AWS)

For public assets, allow read access to your bucket:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

:::warning
This policy makes all objects publicly readable. Only use this for assets that should be publicly accessible. For private assets, consider using signed URLs or CloudFront with Origin Access Control.
:::

### S3-Compatible Services

Most S3-compatible services handle public access differently:

- **Cloudflare R2**: Enable public access in the R2 dashboard or use R2.dev subdomain
- **DigitalOcean Spaces**: Set CDN and file listing options in the Spaces settings
- **MinIO**: Configure bucket policy via `mc policy set public myminio/bucket`
- **Backblaze B2**: Set bucket to "Public" in the B2 dashboard

These services typically don't use AWS IAM policy syntax.

### IAM Policy Example (AWS)

Minimal permissions for the Cockpit IAM user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## Troubleshooting

### Common Issues

**Uploads fail silently**
- Verify credentials are correct
- Check bucket/container permissions
- Ensure region is correctly specified

**Assets not displaying**
- Verify bucket policy allows public read
- Check CORS settings if loading from different domain

**Connection errors with S3-compatible services**
- Ensure the `url` parameter includes the full endpoint
- Verify the service supports the S3 API version used

### Azure-Specific Issues

**"Azure Blob filestorage adapter is not installed"**

This error occurs when you try to use Azure Blob Storage without installing the required dependency.

Solution:
```bash
composer require azure-oss/storage-blob-flysystem
```

**"Azure Blob connection string is not defined"**

Ensure you provide either `account` + `key` or `connectionString`:

```php
'uploads' => [
    'type' => 'azure',
    'account' => 'required',    // Storage Account Name
    'key' => 'required',        // Storage Account Key
    'container' => 'required'   // Container Name
]
```
