# API

Search within an existing index:

### `GET /detektivo/search/{index}`


```bash
curl -X GET "https://cockpit.tld/api/detektivo/search/{index}?q=foobar" \
 -H "api-key: b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/detektivo/search/{index}?q=foobar', {
  method: 'GET',
  headers: {
    "api-key": "b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```

#### Parameters

-
  **q**
  Query string
  type: string
-
  **limit**
  Max amount of itehitsms to return
  type: int
-
  **offset**
  Amount of hits to skip
  type: int

