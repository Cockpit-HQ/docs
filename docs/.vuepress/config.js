const { path } = require('@vuepress/utils')

module.exports = {
  theme: path.resolve(__dirname, 'theme'),

  // make localhost refresh automatically in development mode
  host: 'localhost',

  // common configuration
  lang: 'en-US',
  title: 'Documentation - Cockpit',
  description: 'Cockpit - the simple content platform to manage any structured content - open source - self-hosted.',

  head: [
    ['link', { rel: 'icon', href: '/images/favicon.png' }]
  ],

  plugins: [
    [
      '@vuepress/plugin-search',
      {
        locales: {
          '/': {
            placeholder: 'Search',
          }
        },
      },
    ],
  ],

  themeConfig: {
    contributors: false,
    editLink: false,
    lastUpdated: false,
    logo: '/images/logo.svg',

    sidebar: [
      {
        text: 'Quickstart',
        link: '/quickstart/',
        children: [
          {
            text: 'Installation & Login',
            link: '/quickstart/installation-login/',
            children: [],
          },
          {
            text: 'Create Content',
            link: '/quickstart/create-content/',
            children: [],
          },
          {
            text: 'Use The API',
            link: '/quickstart/use-the-api/',
            children: [],
          }
        ]
      },
      {
        text: 'About',
        link: '/about/',
        children: [
          {
            text: 'Introduction',
            link: '/about/introduction/',
            children: [],
          },
          {
            text: 'Installation',
            link: '/about/installation/',
            children: [],
          },
          {
            text: 'Release Notes',
            link: '/about/release-notes/',
            children: [],
          },
          {
            text: 'Upgrade Guide',
            link: '/about/upgrade-guide/',
            children: [],
          },
        ],
      },
      {
        text: 'Features',
        link: '/features/',
        children: [
          {
            text: 'The Basics',
            link: '/features/basics/',
            children: [],
          },
          {
            text: 'Content',
            link: '/features/content/',
            children: [],
          },
          {
            text: 'Localization',
            link: '/features/localization/',
            children: [],
          },
          {
            text: 'Assets',
            link: '/features/assets/',
            children: [],
          },
        ],
      },
      {
        text: 'API',
        link: '/api/',
        children: [
          {
            text: 'Authentication',
            link: '/api/authentication/',
            children: [],
          },
          {
            text: 'Endpoints',
            link: '/api/endpoints/',
            children: [],
          },
          {
            text: 'Response Codes',
            link: '/api/response-codes/',
            children: [],
          },
        ],
      },
      {
        text: 'Settings & Administration',
        link: '/settings-administration/',
        children: [
          {
            text: 'Users',
            link: '/settings-administration/users/',
            children: [],
          },
          {
            text: 'Roles & Permissions',
            link: '/settings-administration/roles-permissions/',
            children: [],
          },
          {
            text: 'API & Security',
            link: '/settings-administration/api-security/',
            children: [],
          },
          {
            text: 'Locales',
            link: '/settings-administration/locales/',
            children: [],
          },
        ],
      },
      {
        text: 'Addons',
        link: '/addons/',
        children: [
          {
            text: 'Cloud Storage',
            link: '/addons/cloud-storage/',
            children: [],
          },
          {
            text: 'Layout',
            link: '/addons/layout/',
            children: [],
          },
          {
            text: 'Lokalize',
            link: '/addons/lokalize/',
            children: [],
          },
          {
            text: 'Pages',
            link: '/addons/pages/',
            children: [],
          },
          {
            text: 'Sync',
            link: '/addons/sync/',
            children: [],
          },
          {
            text: 'Webhooks',
            link: '/addons/webhooks/',
            children: [],
          }
        ],
      },
      {
        text: 'Ecosystem',
        link: '/ecosystem/'
        /* children: [
          {
            text: 'Tool #1',
            link: '/ecosystem/tool-1/',
            children: [],
          },
          {
            text: 'Library #2',
            link: '/ecosystem/library-2/',
            children: [],
          }
        ], */
      },
    ],
  },
}