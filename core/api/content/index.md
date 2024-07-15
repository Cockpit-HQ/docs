# Content


### `GET /content/item/{model}`

Get single content item

```bash
curl -X GET "https://cockpit.tld/api/content/item/imprint" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/item/imprint', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **locale**
  Return content for specified locale
  type: string
-
  **filter**
  Url encoded filter json
  type: json
-
  **fields**
  Url encoded fields projection as json
  type: json
-
  **populate**
  Populate item with linked content items.
  type: int

---

### `POST /content/item/{model}`

Create or update content item

```bash
curl -X POST "https://cockpit.tld/api/content/item/posts" \
 -H "Content-Type: application/json" \
 -d '{
  "data": {
     "title": "Hello World!"
     "content": "Lorem Ipsum..."
  }
}'
```


```javascript
fetch('https://cockpit.tld/api/content/item/posts', {
  method: 'POST',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
        data: {...}
  })
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **data**
  Content item data
  type: object

---

### `GET /content/item/{model}/{id}`

Get single content item by id

```bash
curl -X GET "https://cockpit.tld/api/content/item/2fd457c3376537fb3d0001e2" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/item/2fd457c3376537fb3d0001e2', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **id**
  Conten item id
  required: true
  type: string
-
  **locale**
  Return content for specified locale
  type: string
-
  **fields**
  Url encoded fields projection as json
  type: json
-
  **populate**
  Populate item with linked content items.
  type: int


---

### `DELETE /content/item/{model}/{id}`

Delete content item by id

```bash
curl -X DELETE "https://cockpit.tld/api/content/item/2fd457c3376537fb3d0001e2" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/item/2fd457c3376537fb3d0001e2', {
  method: 'DELETE',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **id**
  Conten item id
  required: true
  type: string


---


### `GET /content/items/{model}`

Use this API endpoint whenever you want to fetch data from a collection (a content model a list of items).

Example: For a content model *faq* data can be fetched using the following request.

```bash
curl -X GET "https://cockpit.tld/api/content/items/faq" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/items/faq', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **locale**
  Return content for specified locale
  type: string
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
-
  **populate**
  Populate items with linked content items.
  type: int

---


### `GET /content/tree/{model}`

Use this API endpoint whenever you want to fetch nested tree model items.

Example: For a content model *categories* data can be fetched using the following request.

```bash
curl -X GET "https://cockpit.tld/api/content/tree/categories" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/tree/categories', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **model**
  Model name
  required: true
  type: string
-
  **locale**
  Return content for specified locale
  type: string
-
  **fields**
  Url encoded fields projection as json
  type: json
-
  **populate**
  Populate items with linked content items.
  type: int


---


### `GET /content/items`

Batch request content from multiple content models.

Example:

```bash
curl -X GET "https://cockpit.tld/api/content/items?models={faq:{}, articles:{sort:{_created:-1}}}" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/content/items?models={faq:{}, articles:{sort:{_created:-1}}}', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **models**
  Models query config
  required: true
  type: string
-
  **locale**
  Return content for specified locale
  type: string
-
  **populate**
  Populate items with linked content items.
  type: int

---

## Filtering

To filter content items you have to use [Mongo Query](https://www.mongodb.com/docs/manual/reference/operator/query/) syntax.

```bash
curl -X GET "https://cockpit.tld/api/content/items/faq?filter={fieldA:'test'}" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/content/items/faq?filter={fieldA:"test"}', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

## Project Fields to Return from Query

The `fields` parameter is used in API calls to limit the fields returned from the content api. This is useful to narrow down the response to only include necessary information.

Read more about the projection capabilities in the [Mongo Fields Projection](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/) documentation.


Example: Return only the questions of faq items.

```bash
curl -X GET "https://cockpit.tld/api/content/items/faq?fields={question:1}" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```

## Pagination

Pagination allows the retrieval of a subset of entries. It's helpful when dealing with large content collections, as it reduces server load and streamlines the user experience. The parameters `limit` and `skip` are used for pagination.

Example: Get a maximum of 10 posts and skip the first 20

```bash
curl -X GET "https://cockpit.tld/api/content/items/posts?limit=10&skip=20" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```