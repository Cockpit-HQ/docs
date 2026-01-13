# Frontend Integration

Implement Inbox forms in your frontend with HTML, JavaScript, and framework examples.

[[toc]]

## Basic HTML Form

```html
<form action="/api/inbox/submit/{form-token}" method="POST">
    <input type="text" name="data[name]" placeholder="Name" required>
    <input type="email" name="data[email]" placeholder="Email" required>
    <textarea name="data[message]" placeholder="Message" required></textarea>
    <button type="submit">Send</button>
</form>
```

## Redirect After Submission

```html
<form action="/api/inbox/submit/{form-token}?success=/thank-you" method="POST">
    <!-- fields -->
</form>
```

## File Uploads

Accept file uploads by adding `enctype="multipart/form-data"`:

```html
<form action="/api/inbox/submit/{form-token}"
      enctype="multipart/form-data"
      method="POST">

    <label for="name">Name</label>
    <input type="text" name="data[name]" required>

    <label for="resume">Resume</label>
    <input type="file" name="data[resume]">

    <label for="documents">Documents</label>
    <input type="file" name="data[documents]" multiple>

    <button type="submit">Submit Application</button>
</form>
```

## AJAX Submission (Vanilla JavaScript)

```javascript
const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            form.reset();
            alert('Thank you! Your message has been sent.');
        } else {
            alert('Error: ' + (result.error || 'Submission failed'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
    }
});
```

## React Integration

```jsx
import { useState } from 'react';

export function ContactForm({ formToken }) {
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('submitting');
        setError(null);

        const formData = new FormData(e.target);

        try {
            const response = await fetch(`/api/inbox/submit/${formToken}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus('success');
                e.target.reset();
            } else {
                setStatus('error');
                setError(result.error || 'Submission failed');
            }
        } catch (err) {
            setStatus('error');
            setError('Network error. Please try again.');
        }
    }

    if (status === 'success') {
        return <div className="success">Thank you! Your message has been sent.</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="data[name]" placeholder="Name" required />
            <input type="email" name="data[email]" placeholder="Email" required />
            <textarea name="data[message]" placeholder="Message" required />

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send'}
            </button>
        </form>
    );
}
```

## Vue 3 Integration

```js
<script setup>
import { ref } from 'vue';

const props = defineProps(['formToken']);
const status = ref('idle');
const error = ref(null);

async function handleSubmit(e) {
    status.value = 'submitting';
    error.value = null;

    const formData = new FormData(e.target);

    try {
        const response = await fetch(`/api/inbox/submit/${props.formToken}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            status.value = 'success';
            e.target.reset();
        } else {
            status.value = 'error';
            error.value = result.error || 'Submission failed';
        }
    } catch (err) {
        status.value = 'error';
        error.value = 'Network error. Please try again.';
    }
}
</script>

<template>
    <div v-if="status === 'success'" class="success">
        Thank you! Your message has been sent.
    </div>

    <form v-else @submit.prevent="handleSubmit">
        <input type="text" name="data[name]" placeholder="Name" required />
        <input type="email" name="data[email]" placeholder="Email" required />
        <textarea name="data[message]" placeholder="Message" required></textarea>

        <div v-if="error" class="error">{{ error }}</div>

        <button type="submit" :disabled="status === 'submitting'">
            {{ status === 'submitting' ? 'Sending...' : 'Send' }}
        </button>
    </form>
</template>
```

## Next.js Integration

### Client Component

```jsx
'use client';

import { useState } from 'react';

export function ContactForm({ formToken, cockpitUrl }) {
    const [status, setStatus] = useState('idle');

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.target);

        try {
            const response = await fetch(`${cockpitUrl}/api/inbox/submit/${formToken}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setStatus('success');
                e.target.reset();
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    }

    if (status === 'success') {
        return <p>Thank you for your message!</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="data[name]" required />
            <input type="email" name="data[email]" required />
            <textarea name="data[message]" required />
            <button disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send'}
            </button>
            {status === 'error' && <p>Error sending message</p>}
        </form>
    );
}
```

## File Upload with Progress

```javascript
const form = document.getElementById('upload-form');
const progressBar = document.getElementById('progress');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    });

    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
                alert('Files uploaded successfully!');
                form.reset();
            } else {
                alert('Error: ' + result.error);
            }
        } else {
            alert('Upload failed');
        }
        progressBar.style.width = '0%';
    });

    xhr.open('POST', form.action);
    xhr.send(formData);
});
```

### Progress Bar HTML

```html
<form id="upload-form" action="/api/inbox/submit/{token}" enctype="multipart/form-data" method="POST">
    <input type="file" name="data[files]" multiple required>
    <div class="progress-container">
        <div id="progress" class="progress-bar">0%</div>
    </div>
    <button type="submit">Upload</button>
</form>

<style>
.progress-container {
    width: 100%;
    background: #eee;
    border-radius: 4px;
    margin: 10px 0;
}
.progress-bar {
    height: 20px;
    background: #4CAF50;
    border-radius: 4px;
    text-align: center;
    color: white;
    transition: width 0.3s;
}
</style>
```

## Honeypot Implementation

Include a hidden honeypot field to catch bots:

```html
<form action="/api/inbox/submit/{form-token}" method="POST">
    <!-- Honeypot - hidden from users -->
    <div style="position: absolute; left: -9999px;">
        <input type="text" name="data[website]" tabindex="-1" autocomplete="off">
    </div>

    <input type="text" name="data[name]" placeholder="Name" required>
    <input type="email" name="data[email]" placeholder="Email" required>
    <textarea name="data[message]" placeholder="Message" required></textarea>

    <button type="submit">Send</button>
</form>
```

Configure `website` as the honeypot field in your form settings.

## Custom Headers

For authenticated submissions:

```javascript
const formData = new FormData(form);

const response = await fetch('/api/inbox/submit/' + formToken, {
    method: 'POST',
    body: formData,
    headers: {
        'api-key': API_KEY // If required
    }
});
```

## Error Handling Best Practices

```javascript
async function submitForm(form, formToken) {
    const formData = new FormData(form);

    try {
        const response = await fetch(`/api/inbox/submit/${formToken}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        switch (response.status) {
            case 200:
                return { success: true, data: result };
            case 404:
                return { success: false, error: 'Form not found' };
            case 412:
                return { success: false, error: result.error || 'Validation failed' };
            default:
                return { success: false, error: 'Unknown error' };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}
```
