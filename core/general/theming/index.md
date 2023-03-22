# Theming

[[toc]]

One of the benefits of using Cockpit CMS is the ability to customize its appearance with your own branding, including custom logo, colors and favicon. Great for white-labeling.

## Adding a custom logo

To replace the default Cockpit CMS logo with your own, save your custom logo as an SVG file and move the logo file to `/config/logo.svg`.

Done!


## Changing the color scheme

To customize the color scheme of your Cockpit admin interface, you'll need to create the following file: `/config/style.css`.

An example to change the primary color:

```css

:root {
    --kiss-color-primary: #8932ff;
}

```

Take a look at `/modules/App/assets/css/app.css` if you're looking for specific custom css properties.


## Changing the favicon

To replace the default Cockpit CMS favicon with your own, save your custom favicon as a PNG file and move the file to `/config/favicon.png`.

Done!