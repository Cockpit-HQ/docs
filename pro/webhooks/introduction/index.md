# Webhooks

The Webhooks add-on enables real-time communication between Cockpit and external services or applications by automatically sending HTTP requests - called webhooks - when specific events occur. This functionality is crucial in modern web applications, as it allows for seamless integration and automation of various processes.

You can easily configure webhook endpoints, define the events that trigger webhooks, and customize the payload format to suit your needs. Some common event triggers include content creation, updates, or deletions. The add-on offers options for authentication and security measures.

Go to **Settings > Webhooks** to manage your sync jobs.

![Screenshot of creating a webhook](./create-webhook.png)

## Events

Some possible event names that can be used to trigger a wbhook:

- `content.item.save`
- `content.item.save.{modelName}`
- `pages.page.save`
- `lokalize.project.save`