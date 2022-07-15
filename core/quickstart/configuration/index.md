# Configuration

By default, Cockpit doesn't need any further configuration to run. However, you might want to use MongoDB instead of SQLite as your favorite data storage. Therefore Cockpit provides an easy way to tweak some settings.


## Config options

`/config/config.php`

```
<?php

return [

    # cockpit instance name
    'app.name' => 'My Project X',

    # cockpit session name
    'session.name' => 'mysession',

    # app custom security key
    'sec-key' => 'xxxxx-SiteSecKeyPleaseChangeMe-xxxxx',

    # site url (optional) - helpful if you're behind a reverse proxy
    'site_url' => 'https://cms.mydomain.com',

    # use mongodb as main data storage
    'database' => [
        'server' => 'mongodb://localhost:27017',
        'options' => [
            'db' => 'cockpitdb'
        ]
    ],

    # use redis for memory storage
    'memory' => [
        'server' => 'redis://localhost:55001',
        'options' => []
    ],

    # use smtp to send emails
    'mailer' => [
        'from'       => 'info@mydomain.tld',
        'transport'  => 'smtp'
        'host'       => 'smtp.myhost.tld',
        'user'       => 'username'
        'password'   => 'xxpasswordxx',
        'port'       => 25,
        'auth'       => true,
        'encryption' => '' # '', 'ssl' or 'tls'
    ]

    # Define Access-Control (CORS) settings.
    # Those are the default values. You don't need to duplicate them all.
    'cors' => [
      'allowedHeaders' => 'X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding, Cockpit-Token',
      'allowedMethods' => 'PUT, POST, GET, OPTIONS, DELETE',
      'allowedOrigins' => '*',
      'maxAge' => '1000',
      'allowCredentials' => 'true',
      'exposedHeaders' => 'true',
    ],
];
```