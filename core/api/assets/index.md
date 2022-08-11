# Assets

### `GET /assets/{id}`

Get asset object by asset id

```bash
curl -X GET "https://cockpit.tld/api/assets/2fd457c3376537fb3d0001e2" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/assets/2fd457c3376537fb3d0001e2', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Parameters

 -
    **id**
    Asset ID
    type: string


---


### `GET /assets/image/{id}`

The *Image*-API can be used to generate thumbnails of image assets

```bash
curl -X GET "https://cockpit.tld/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0" \
 -H "api-key: a2ea86ea065a6d2301a8b4a535bc"
```


```javascript
fetch('https://cockpit.tld/api/assets/image/2fd457c3376537fb3d0001e2?m=thumbnail&h=500&q=500&o=0', {
  method: 'GET',
  headers: {
    "api-key": "a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Parameters

-
  **id**
  Asset ID
  required: true
  type: string
-
  **m**
  Resize mode: [thumbnail, bestFit, resize,fitToWidth,fitToHeight]
  type: string
-
  **w**
  Width
  type: int
-
  **h**
  Height
  type: int
-
  **q**
  Quality
  type: int
-
  **mime**
  Mime type: [auto,gif,jpeg,png,webp,bmp]
  type: int
-
  **re**
  Auto redirect to generated thumbnail
  type: int
-
  **t**
  Time string for cache invalidation - usable for cache invalidation
  type: string
-
  **o**
  Get binary of generated thumbnail
  type: int
