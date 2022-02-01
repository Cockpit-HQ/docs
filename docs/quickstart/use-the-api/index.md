# Use The API

::: tip Hey there!
This is the quickstart section of the Cockpit documentation. It provides just a subset of documentation required to take your first steps with Cockpit. Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.
:::

[[toc]]

## Prerequisites

Make sure you follow the instructions in our [Installation & Login](/quickstart/installation-login/) as well as the [Create Content](/quickstart/create-content/) quickstart guide before you continue reading these instructions.

## The step-by-step guide

### Create an API token

1. Login to your Cockpit installation at [https://cockpit.example.com](https://cockpit.example.com)
2. Navigate to your Admin user's profile at [https://cockpit.example.com/system/users/user](https://cockpit.example.com/system/users/user)
3. Create an API key if not available yet
4. Copy the API key to your clipboard
5. Click *Update* to save your user account changes
6. In the following guides we use `USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc` as an example API key

### Fetch items from a collection

> NOTE: we continue to use `USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc` as an example API key here. Make sure to replace it by your admin user's API key.

1. Create a simple native JavaScript function to serve as a client
2. Use the [https://cockpit.example.com/api/content/item/product](https://cockpit.example.com/api/content/item/product) API operation as endpoint
3. Pass your token inside the request headers
4. Execute in your browser's dev-tools to check if the items created in our previous tutorial are returned correctly

<CodeGroup>
  <CodeGroupItem title="cURL">

```bash:no-line-numbers
curl -X GET "https://cockpit.example.com/api/content/items/product" \
 -H "api-key: USR-b2a6ef408b69a2ea86ea065a6d2301a8b4a535bc"
```

  </CodeGroupItem>

  <CodeGroupItem title="JavaScript" active>

```javascript:no-line-numbers
fetch('https://cockpit.example.com/api/content/items/product', {
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

5. This will result in a response similar to the following:

```json:no-line-numbers
[
  {
    "name": "Product A",
    "_modified": 1638905677,
    "_mby": "ab64ef93343265d420000110",
    "_created": 1638903275,
    "_state": 1,
    "_cby": "ab64ef93343265d420000110",
    "_id": "de79b56264336247060003c9"
  }
]
```
6. Congratulations! You made your first API request to retrieve content from Cockpit.

## Next step

Check out Cockpit's documentation in detail at [About](/about/).

## Further reading

* If you want to read about Cockpit in depth, just have a look at this documentation's [About](/about/) section.
* Detailed information about the Cockpit API can be found at [API](/api/) .