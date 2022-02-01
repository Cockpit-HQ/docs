# Authentication

::: tip Important notes
This is the API section of the Cockpit documentation. Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.

Cockpit itself provides a very useful API playground at [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api) you can use at any time to investigate the API and your data in the admin panel. Try it!
:::

[[toc]]

## Introduction

Generally speaking, authenticating with Cockpit's API is pretty easy. 

1. Whenever you want to fetch data from any REST-API endpoint via HTTP request a token should be passed inside every request's `api-key` header value.
2. In addition, it's REST-API endpoint, Cockpit also provides a GraphQL based API. Authenticating with the GraphQL API also requires a token to be passed.

> In the following examples we use `USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc` as an example API key.

## Managing tokens

### How to create a token

1. Login to your Cockpit installation at [https://cockpit.example.com](https://cockpit.example.com)
2. Navigate to your user's profile at [https://cockpit.example.com/system/users/user](https://cockpit.example.com/system/users/user) or the profile of the user you want to create a token for
3. Create an API key if not available yet
4. Copy the API key to your clipboard
5. Click *Update* to save your user account changes

### How to invalidate a token

1. Login to your Cockpit installation at [https://cockpit.example.com](https://cockpit.example.com)
2. Navigate to your user's profile at [https://cockpit.example.com/system/users/user](https://cockpit.example.com/system/users/user) or the profile of the user you want invalidate a token for
3. In the *API Key* section click *Refresh* to generate a new token
4. The old token is now invalid

## REST-API

### Authenticate using a token

As soon as you have generated an API-token, using Cockpit's REST-API is pretty straightforward. Put the token inside the HTTP-request headers for every single request.

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/pages/menus" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/pages/menus', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

  </CodeGroupItem>
</CodeGroup>

### Using API endpoints without tokens - the public API

In some cases you might expect Cockpit to provide data for your application without using an API-token. If you do, there's a couple of steps required to make it work. 

In a nutshell, the public API works by [configuring a user role](/settings-administration/roles-permissions/) to use in the public API (unauthenticated requests). As every role has a configurable set of permissions to your content, it usually takes just a couple of minutes to set everything up at your expectations. However, it still gives you control over Cockpit's data by restricting access for the public API. 

1. Login to your Cockpit installation at [https://cockpit.example.com](https://cockpit.example.com)
2. Navigate to the roles section at [https://cockpit.example.com/system/users/roles](https://cockpit.example.com/system/users/roles)
3. Click *Add role*
4. Ensure to provide an appid (i.e. *public*), a suitable name (i.e. *Public API*) and set permissions at will
5. Save the new role
6. Afterwards go to the API section at [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api)
7. Click *Public API*
8. Click *No role set* below the *Role* and choose your role (*Public API* if you followed our suggestion above) 
9. Click *Save* to finish the setup
10. You can now use the API endpoints, the created role hast permission to

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/pages/menus"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/pages/menus', {
  method: 'GET'
})
.then(response => response.json())
.then(response => console.log(response));
```

  </CodeGroupItem>
</CodeGroup>

## GraphQL

::: warning Work in progress
This section is still missing content. We are currently working on it.
:::