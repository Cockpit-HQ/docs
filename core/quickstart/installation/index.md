# Installation

[[toc]]

## Setup

The following steps describe the setup of a fresh new installation of Cockpit.

1. [Download](https://getcockpit.com/start-journey) the latest version of Cockpit
2. Extract the archive
3. Deploy files to your webserver's root directory (or any sub-folder)
4. Navigate to your Cockpit installation folder at **/install/**
5. Ensure write permissions for the **/storage** directory.
6. Open the administration panel
7. Login with username **admin** and generated password
8. Congratulations! You managed to install Cockpit successfully.

::: Note
To make the installation process as simple as possible, Cockpit creates a default admin account. Please change the password after your first login.
:::

## Docker

Pull the Cockpit CMS Docker image from Docker Hub (Core or Pro):

**CORE:**
```bash
docker pull cockpithq/cockpit:core-latest
``````

**PRO:**
```bash
docker pull cockpithq/cockpit:pro-latest
```

Run the Cockpit CMS container:

```bash
docker run -d --name cockpit -p 8080:80 cockpithq/cockpit:pro-latest
```

This starts a Cockpit CMS container named cockpit, accessible on port 8080.

Access Cockpit CMS by navigating to http://localhost:8080/install in your web browser.

If you need to persist data or configure Cockpit further, you might consider mounting a volume for the `.spaces`, `storage` and `config` directory or customizing the Docker container to suit your needs.


---

## Troubleshooting

### Cockpit displays a blank page

If you see a blank page we recommend checking your server logs. Next make sure you display PHP error messages. In most cases you should see some errors where the blank page was displayed before.

### Cockpit does not save changes correctly

If changes to your content, content-models, settings or anything else you administer in Cockpit's admin panel get lost, please check the directory write permissions for your Cockpit installation as described in [Setup](#setup).
