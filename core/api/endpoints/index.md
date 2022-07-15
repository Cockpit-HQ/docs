# Endpoints


[[toc]]

## Introduction

This documentation of API endpoints provides additional information on each endpoint and shows usage examples. If you want to know about each endpoint in detail we recommend using Cockpit's API playground at **/system/api** as mentioned above.

> In the following examples we use `a2ea86ea065a6d2301a8b4a535bc` as an example API key.

## Assets

### Image

The *Assets*-API can be used retrieve the public URL to the given image as well as the binary data of it. The client can control the type of response at any time using the *o* parameter

* `o=0` returns the public URL to the image asset in its response
* `o=1` returns the binary data of the image asset in its response

Endpoint: `GET /assets/image/{id}`

```bash
curl -X GET "https://cockpit.example.com/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.example.com/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.text())
.then(data => console.log(data));
```


## Content

Cockpit's *Content*-API provides endpoints for retrieving data of its so-called content models.

### Singletons

Use this API endpoint whenever you want to fetch data from a singleton (a content model with only one item).

Endpoint: `GET /content/item/{model}`

Example: For a content model singleton *imprint* data can be fetched using the following request.

```bash
curl -X GET "https://cockpit.example.com/api/content/item/imprint" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.example.com/api/content/item/imprint', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Collection items

Use this API endpoint whenever you want to fetch data from a collection (a content model a list of items).

Endpoint: `GET /content/items/{model}`

Example: For a content model *faq* data can be fetched using the following request.

```bash
curl -X GET "https://cockpit.example.com/api/content/items/faq" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.example.com/api/content/items/faq', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Filtering

To filter collection items you have to use [Mongo Query](https://www.mongodb.com/docs/manual/reference/operator/query/) syntax.

```bash
curl -X GET "https://cockpit.example.com/api/content/items/faq?filter={fieldA:'test'}" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.example.com/api/content/items/faq?filter={fieldA:"test"}', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```