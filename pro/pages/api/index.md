# API

## Menus

Use the *Menus*-API endpoint whenever you want to fetch the full list of all of your menus.

Endpoint: `GET /pages/menus`


```bash
curl -X GET "https://cockpit.tld/api/pages/menus" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/menus', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Menu

Whenever you want to fetch one menu from Cockpit the *Menu*-API endpoint can be used.

Endpoint: `GET /pages/menu/{name}`

Example: For a menu *main* the menu data can be fetched using the following request.


```bash
curl -X GET "https://cockpit.tld/api/pages/menu/main" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/menu/main', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


## Pages

Use the *Pages*-API endpoint whenever you want to fetch the full list of all of your pages.

Endpoint: `GET /pages/pages`


```bash
curl -X GET "https://cockpit.tld/api/pages/pages" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/pages', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **filter**
  Url encoded filter json
  type: json
-
  **sort**
  Url encoded sort json
  type: json
-
  **fields**
  Url encoded fields projection as json
  type: json
-
  **limit**
  Max amount of items to return
  type: int
-
  **skip**
  Amount of items to skip
  type: int


## Page

### Fetching a page by slug

Whenever you want to fetch a single page item by page *slug* the *Page*-API can be used.

Endpoint: `GET /pages/page`

Example: For a page with slug *home* the data can be fetched using the following request. Make sure to prefix your page's slug when passing as parameter, i.e. `route=/home` for the slug *home*


```bash
# Note: the route GET param is URL decoded: /home => %2Fhome
curl -X GET "https://cockpit.tld/api/pages/page?route=%2Fhome" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/page?route=/home', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Fetching a page by id

Whenever you want to fetch a single page item by id the *Page*-API can be used.

Endpoint: `GET /pages/page/{id}`

Example: For a page with id *3bfc72d9343631c575000111* the data can be fetched using the following request.


```bash
curl -X GET "https://cockpit.tld/api/pages/page/3bfc72d9343631c575000111" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/page/3bfc72d9343631c575000111', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Routes

By using the *Routes*-API endpoint you can fetch the list of all routes for pages. In contrast to the Pages-API endpoint it does not return page content, but just a lightweight response of routes, slugs and page types. If the `locale` parameter is not provided all routes are grouped by locale and all locales are returned.

Endpoint: `GET /pages/routes`


```bash
curl -X GET "https://cockpit.tld/api/pages/routes" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/routes', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Settings

By using the *Settings*-API endpoint you can fetch the settings for pages. This contains SEO metadata as well as images, scripts and more.

Endpoint: `GET /pages/settings`


```bash
curl -X GET "https://cockpit.tld/api/pages/settings" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/settings', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```


### Sitemap

The *Sitemap*-API endpoint returns the complete sitemap of pages.

Endpoint: `GET /pages/sitemap`


```bash
curl -X GET "https://cockpit.tld/api/pages/sitemap" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/pages/sitemap', {
  method: 'GET',
  headers: {
    "api-key": "USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```
