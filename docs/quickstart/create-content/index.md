# Create Content

::: tip Hey there!
This is the quickstart section of the Cockpit documentation. It provides just a subset of documentation required to take your first steps with Cockpit. Note, that we use [https://cockpit.example.com](https://cockpit.example.com) as domain in our examples, which has to be replaced by your domain in all code snippets or links below.
:::

[[toc]]

## Prerequisites

Make sure you follow the instructions in our [Installation & Login](/quickstart/installation-login/) quickstart guide before you continue reading these instructions.

## The step-by-step guide

### Create a content model

1. Login to your Cockpit installation at [https://cockpit.example.com](https://cockpit.example.com)
2. Navigate to *Content* at [https://cockpit.example.com/content](https://cockpit.example.com/content)
3. Click *Create model*
4. As *Type* select *Collection* so we can create lots of items later on
5. Fill in the fields
    * Name: `employee`
    * Display name: `Employee`
6. Continue by adding a field to the model by clicking *plus*
7. Fill in the fields
    * Name: `name`
    * Type: `Text` (default)
    * Display name: `Name`
    * Required: `yes`
8. Click *Add field* to add the field
9. Click *Create model* to save

### Add items to your collection

1. Navigate to *Content* at [https://cockpit.example.com/content](https://cockpit.example.com/content) again
2. In the list of collection you should see your *Empoyee* collection
3. Click on it to start adding items
4. Click *Create item*
5. Fill in the fields
    * Name: `Employee A` (or another unique name, you did not use before)
6. Click *Create item* again to save the item to collection
7. Afterwards make sure to *publish* the item using the dropdown for *State* in the right
8. You can now
    * continue to add items by starting at 1. again 
    * or stop here and continue with our [next guide](/quickstart/use-the-api/)

## Next step

See how to fetch content in Cockpit by example in our next quickstart guide [Use The API](/quickstart/use-the-api/).

## Further reading

* If you want to read about Cockpit in depth, just have a look at this documentation's [About](/about/) section.
* Detailed information about content management with Cockpit can be found at [Features](/features/) .