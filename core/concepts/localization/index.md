# Localization

[[toc]]

## Introduction

Use Cockpit's locales settings and localization features whenever you need to translate your content in [content items](/concepts/content).

*Locales* define the languages you want to use in your content. Define and use locals whenever you want to provide content in different translations.

## Managing locales

You can set up localization as described in the following steps:

1. Login to your Cockpit installation
2. Navigate to *Settings > Locales*
3. See the list of locales, that have already been created
4. Add new locales or modify existing locales

![Screenshot of the list of locales](./locales-list.png)


## Enable localized content for fields

In order to localize content you need to enabled localization by activating the *localize field* option foreach field you want to localize on your content models.

![Screenshot of field settings](./content-model-enable-localize-field.png)

## How to localize content

After you enabled *localize field* as described in [Enable localized content for fields](#enable-localized-content-for-fields) the field can be translated using any of your [Locales](#managing-locales).

1. Login to your Cockpit installation
2. Navigate to *Content*
3. See the list of collections and singletons
4. Click the collection you want to add or modify content for
5. Display the locales you want to translate in the right section called *Translation*
6. Provide different content foreach localized field
7. That's it. Localized content will be available from Cockpit's [API](/api/endpoints/#content)

![Screenshot of item with localized fields displayed](./edit-item-with-locales-displayed.png)

## How to localize the administration panel

Before you start check if your desired translation / language is already available in the [i18n repository](https://github.com/Cockpit-HQ/i18n).

If the translation is **already available**:<br />
Copy the translation to the `/config/i18n/` folder.

If the translation is **not yet available**:<br />
Create new empty localization files by running `php ./tower app:i18n:create` from the root directory of Cockpit. After that manually translate all strings in the files.


Lastly sign-in to the administration panel and choose the desired language for your user(s) in the account settings under "Admin UI language".

![Screenshot of account settings](./localize-admin-ui.png)
