# Requirements

[[toc]]


Cockpit doesn't require anything special to run out of the box. Most of the the hard requirements should be available on any standard php based environments.

Only if you plan to use Redis and MongoDB for data storage, you might need to do some extra steps to install additional extensions.

::: MongoDB
If you plan to use MongoDB for data storage, make sure that you run MongoDB with _server side javascript_ enabled.
:::

## General

* PHP >= 8.1
* PDO with SQLite support or [mongodb extension](https://pecl.php.net/package/mongodb) to use MongoDB as data storage
* Apache (with mod_rewrite enabled) or nginx
* Any modern browser


## Required PHP Extensions

* CURL
* DOM
* Fileinfo
* GD
* JSON
* OpenSSL
* PCRE
* Zip
