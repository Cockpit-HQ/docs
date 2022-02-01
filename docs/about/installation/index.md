# Installation

::: tip Important notes
Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.
:::

[[toc]]

## System requirements

* PHP >= 8.0
* PDO with SQLite support (or MongoDB)
* GD, Zip extension enabled
* Apache (with mod_rewrite enabled) or nginx
* Any modern browser

**That's it**. No generation or build scripts, no heavy-weight PHP libraries or dependencies. Cockpit was successfully tested on Apache and nginx.

## Setup

The following steps describe the setup of a fresh new installation of Cockpit.

1. [Download](https://getcockpit.com/download) the latest version of Cockpit
2. Extract the archive
3. Deploy files to your [webserver](/about/installation/)'s root directory (or any sub-folder)
4. Navigate to your Cockpit installation folder at [https://cockpit.example.com/installation/](https://cockpit.example.com/installation/)
5. Ensure write permissions for the *storage* directory.
6. Open the administration panel at [https://cockpit.example.com/](https://cockpit.example.com/)
7. Login with username `admin` and password `admin`
8. Congratulations! You managed to install Cockpit successfully.

## Troubleshooting

### Cockpit displays a blank page

If you see a blank page when navigating to [https://cockpit.example.com/](https://cockpit.example.com/) we recommend checking your server logs. Next make sure you display PHP error messages. In most cases you should see some errors where the blank page was displayed before.

### Cockpit does not save changes correctly

If changes to your content, content-models, settings or anything else you administer in Cockpit's admin panel get lost, please check the directory write permissions for your Cockpit installation as described in [Setup](#setup).

### Other issues

Whenever you run into issues using Cockpit and you did not find a solution here, make sure to

1. have a look at the questions and problems posted at [Stack Overflow](https://stackoverflow.com/questions/tagged/cockpit-cms). Maybe someone ran into the same issue before and you can find a solution there.
2. read through the list of issues on [Github](https://github.com/Cockpit-HQ/cockpit-next/issues). Maybe the issue is open, so you can contribute in some way. If it has been solved before the solution probably works for your problem. 
3. get in touch with the Cockpit community by submitting a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/cockpit-cms) or posting an issue on [Github](https://github.com/Cockpit-HQ/cockpit-next/issues) yourself if you did not find a solution.

## Further reading

* More information on Cockpit's features can be found at [Features](/features/).
* If you want to read about Cockpit's settings in depth, just have a look at this documentation's [Settings & Administration](/settings-administration/) section.