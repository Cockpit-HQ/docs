# Endpoints

::: tip Important notes
This is the API section of the Cockpit documentation. Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.

Cockpit itself provides a very useful API playground at [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api) you can use at any time to investigate the API and your data in the admin panel. Try it!
:::

[[toc]]

## Introduction

This documentation of API endpoints provides additional information on each endpoint and shows usage examples. If you want to know about each endpoint in detail we recommend using Cockpit's API playground at [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api) as mentioned above.

> In the following examples we use `USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc` as an example API key.

## Assets

### Image

The *Assets*-API can be used retrieve the public URL to the given image as well as the binary data of it. The client can control the type of response at any time using the *o* parameter

* `o=0` returns the public URL to the image asset in its response
* `o=1` returns the binary data of the image asset in its response

Endpoint: `GET /assets/image/{id}`

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.text())
.then(data => console.log(data));
```

  </CodeGroupItem>
</CodeGroup>

## Content

Cockpit's *Content*-API provides endpoints for retrieving data of its so-called content models.

### Singletons

Use this API endpoint whenever you want to fetch data from a singleton (a content model with only one item).

Endpoint: `GET /content/item/{model}`

Example: For a content model singleton *imprint* data can be fetched using the following request.

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/content/item/imprint" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/content/item/imprint', {
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

### Collection / items

Use this API endpoint whenever you want to fetch data from a collection (a content model a list of items).

Endpoint: `GET /content/items/{model}`

Example: For a content model *faq* data can be fetched using the following request.

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/content/items/faq" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/content/items/faq', {
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