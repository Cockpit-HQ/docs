# Sync

The Sync add-on is an extension focused on enabling seamless synchronization of assets, models, content, pages, and more between multiple Cockpit instances. As projects grow and evolve, the need for efficient collaboration and data consistency across environments becomes essential. This add-on addresses this requirement by offering developers and content authors an easy-to-use solution for synchronizing data between different Cockpit installations.

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


