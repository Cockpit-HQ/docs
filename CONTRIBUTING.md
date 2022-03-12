# Contributing

Contributions are welcome, please refer to our [Best practices](#best-practices).

We accept contributions via pull requests on [Github](https://www.github.com).

## Preview your changes

Cockpit's documentation is built on top of [Vuepress](https://v2.vuepress.vuejs.org/). If you want to contribute make sure to preview your changes in a local environment.

1. Clone this repository
2. run `npm install`
3. run `npm run docs:dev`
4. Navigate to *http://localhost:8080* inside your browser
5. View the documentation

## Best practices

* Please write in English.
* Use`:no-line-numbers` in all code blocks you create.
* Provide examples as *cURL* and *JavaScript* always. 
* When including screenshots from the Cockpit administration panel, use the *lightmode*.
* Use proper spelling except for page headlines: write page headlines (and the menu items belonging to the page) in uppercase first letters i.e. *"My Example Page"* instead of *"My example page"*.
* Mark *incomplete areas* with the following hint:
    ```
    ::: warning Work in progress
    This section is still missing content. We are currently working on it.
    :::
    ```