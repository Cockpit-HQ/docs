# CloudStorage

The CloudStorage add-on is aimed at simplifying the process of storing and managing digital assets in the cloud. With the growing reliance on cloud-based storage solutions, this add-on empowers developers to seamlessly integrate their Cockpit projects with popular cloud storage providers, such as Amazon S3, Google Cloud Storage, and Microsoft Azure Blob Storage.

Featuring an intuitive configuration process, the CloudStorage add-on allows easily to connect to your preferred cloud storage service, and configure the necessary settings, such as access keys, buckets, and storage regions.


:::info
Currently only Amazon S3 and services having a S3 compatible api are supported.
:::


## Configuration

`/config/config.php`

```php
<?php

return [
    'cloudStorage' => [
        'uploads' => [
            'url' => getenv('S3_URL'), // Set this value if you use a S3 compatible service / api
            'key' => getenv('S3_KEY'),
            'secret' => getenv('S3_SECRET'),
            'region' => 'eu-central-1',
            'bucket' => getenv('S3_BUCKET')
        ]
    ]
];
```
