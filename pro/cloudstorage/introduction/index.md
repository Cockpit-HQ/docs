# CloudStorage

The CloudStorage addon adds support for cloud storage providers to store assets or thumbnails.

:::info
Currently only Amazon S3 is supported but more providers are already in the pipeline.
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