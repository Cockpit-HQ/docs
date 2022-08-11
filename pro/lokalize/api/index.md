# API


Get translation strings by project

Endpoint: `GET /lokalize/project/{name}`


```bash
curl -X GET "https://cockpit.tld/api/lokalize/project/{name}" \
 -H "api-key: b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

```javascript
fetch('https://cockpit.tld/api/lokalize/project/{name}', {
  method: 'GET',
  headers: {
    "api-key": "b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
  }
})
.then(response => response.json())
.then(response => console.log(response));
```