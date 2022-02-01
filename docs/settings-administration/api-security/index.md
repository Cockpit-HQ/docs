# API & Security

::: tip Important notes
Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.
:::

[[toc]]

## Introduction

For API specific settings navigation to [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api). The following sections give you a brief overview about it.

## API playgrounds

Cockpit provides two useful API playgrounds. 

1. The REST-API playground
2. The GraphQL playground

Navigate to [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api) in order to test and query your API endpoints with real data.

## The public API

::: danger Caution!
Bad public API configuration probably exposes data to the world wide web without restrictions. Even worse, it can result in having unauthenticated users delete or write data to Cockpit using the API.
:::

The public API is Cockpit's way of providing access to data for unauthenticated clients. In some cases you may want to give all clients - even unauthenticated ones - access to assets, collections, singletons, pages or other data stored in Cockpit. 

You can make this work by using the *public API*:

1. Navigation to [https://cockpit.example.com/system/api/public](https://cockpit.example.com/system/api/public)
2. Select a [Role](/settings-administration/roles-permissions/)
    * Make sure to select an appropriate role, if not available
    * create a custom role used by the public API only, so things don't get mixed up
3. Click *Save* to save the changes
4. Congratulations, your public API is now available with permissions from your selected role.

## Additional API keys

In addition to user-based [API keys](/settings-administration/users/) Cockpit provides the option to create custom API keys, that do not belong to a user. 

Foreach API key the following data has to be provided:

* **name**: the API key name, should make it easy to recognize the purpose of the API key
* **role**: the [Role](/settings-administration/roles-permissions/) defines the permissions when accessing Cockpit's API with this key
* **API-key**: the unique API key token, ca be refreshed anytime

Example:

![Screenshot of the api key form](./api-key-edit.png)

## Further reading

* If you want to read about Cockpit's *Roles & Permissions* system in depth, just have a look at this documentation's [Roles & Permissions](/settings-administration/roles-permissions/) section.
* Detailed information about the Cockpit API can be found at [API](/api/) .