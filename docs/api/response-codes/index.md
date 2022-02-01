# Response Codes

::: tip Important notes
This is the API section of the Cockpit documentation. Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.

Cockpit itself provides a very useful API playground at [https://cockpit.example.com/system/api](https://cockpit.example.com/system/api) you can use at any time to investigate the API and your data in the admin panel. Try it!
:::

[[toc]]

## Introduction

In general, Cockpit makes use of HTTP status codes to indicate the status for all API requests. 

| Code | Label               | Description                                        |
| :--- | :------------------ | -------------------------------------------------: |
| 200  | Okay                | A successful request                               |
| 401  | Unauthorized        | Invalid token or unauthorized or permission denied |
| 404  | Not Found           | The requested item could not be found              |
| 412  | Precondition Failed | Missing parameters / validation errors             |

## Response

In addition to it's HTTP status codes Cockpit also provides useful meta information in the response body of every response, i.e.

```json:no-line-numbers
{
    "error": "Authentication failed"
}
```

## Further reading

* For a full list of HTTP status codes take a look at this [Cheatsheet](https://devhints.io/http-status)