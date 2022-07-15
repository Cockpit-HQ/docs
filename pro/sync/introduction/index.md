# Sync

Push or pull resources between different Cockpit instances.


## Sync key

::: Important
Define for each Cockpit instance its own sync key in Cockpits config file.
:::

`/config/config.php`

```php
<?php

return [
    'sync' => [
        'syncKey' => '***secretkey***'
    ]
];
```


## Sync targets

Go to **Settings > Sync** to manage your sync jobs.

![Screenshot of sync targets](./sync-targets.png)

## Run sync

Select the resources to sync and whether to push or pull content from the sync target.

![Screenshot of run sync](./sync-run.png)


