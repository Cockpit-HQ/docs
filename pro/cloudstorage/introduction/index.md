# CloudStorage

The CloudStorage addon adds support for cloud storage providers to store assets or thumbnails.

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
            'key' => getenv('S3_KEY'),
            'secret' => getenv('S3_SECRET'),
            'region' => 'eu-central-1',
            'bucket' => getenv('S3_BUCKET')
        ]
    ]
];
```