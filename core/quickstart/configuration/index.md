# Configuration

By default, Cockpit doesn't need any further configuration to run. However, the default configuration settings are insecure that allow file upload of any type and use a default custom security key. Additionally, you might want to use MongoDB instead of SQLite as your favorite data storage.

Cockpit provides an easy way to tweak some settings. Below is an example configuration file.

It is important to note that developers and users of Cockpit CMS are responsible for hardening their Cockpit CMS server.

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
    # CHANGE THIS IN YOUR CONFIGURATION SETTING
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
        'transport'  => 'smtp',
        'host'       => 'smtp.myhost.tld',
        'user'       => 'username',
        'password'   => 'xxpasswordxx',
        'port'       => 25,
        'auth'       => true,
        'encryption' => '' # '', 'ssl' or 'tls'
    ],

    ##
    # Only allow files with the 'png, jpg, jpeg' extension to be uploaded
    ##
    
    # Only allow 'png, jpg, jpeg' using the Assets API
    'assets' => [
        'allowed_uploads' => 'png, jpg, jpeg'
    ],

    # Only allow 'png, jpg, jpeg' using the Finder API
    'finder.allowed_uploads' => 'png, jpg, jpeg',

    # Define Access-Control (CORS) settings.
    # Those are the default values. You don't need to duplicate them all.
    'cors' => [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Max-Age' => '1000',
        'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding, API-KEY',
        'Access-Control-Allow-Methods' => 'PUT, POST, GET, OPTIONS, DELETE',
        'Access-Control-Expose-Headers' => 'true',
    ],
];
```
