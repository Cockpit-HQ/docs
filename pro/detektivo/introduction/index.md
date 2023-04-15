# Detektivo


Detektivo is a lightweight full-text search and indexing add-on. It streamlines the process of managing and searching content, eliminating the need for third-party services like Algolia or Elasticsearch for small to mid-size projects. With its flexible storage engine options, advanced search capabilities, and seamless integration with Cockpit, Detektivo enhances the overall content management experience for developers and users alike.

![Screenshot of an index](./index.jpg)

## Indexing engine configuration

By default, Detektivo uses SQLite's FTS5 storage engine for indexing content but also provides support for MeiliSearch, allowing users to choose the engine that best suits their needs. No further configuration needed if you decide to go with SQLite. If you want to use [Meilisearch](https://www.meilisearch.com/), then you need to add some additional configuration to `/config/config.php`:

```
<?php

return [

    'search' => [
        'server' => 'meilisearch://serverurl.host',
        'options' => ['api_key' => 'xxxapikeyxxx']
    ],

];

```