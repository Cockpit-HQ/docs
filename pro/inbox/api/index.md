# API

Submit data to form

### `POST /inbox/submit/{form-token}`


** Via HTML form: **

```html
<form id="form" action="/api/inbox/submit/{form-token}" method="POST">
    <label for="email-address">Email Address</label>
    <input type="email" id="email" name="data[email]" required>
    <label for="email-message">Message</label>
    <textarea type="email" id="message" name="data[message]" required></textarea>
    <button type="submit">Submit</button>
</form>
```

** Via JavaScript and `fetch`: **

```javascript

const formData = new FormData(form);

fetch('https://cockpit.tld/api/inbox/submit/{form-token}', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(response => console.log(response));
```


#### Parameters

-
  **success**
  Redirect url after successfull submission
  type: string
-
  **subject**
  Subject of the notification email
  type: string
