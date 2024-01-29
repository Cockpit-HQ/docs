# Autopilot

## Overview

This AI addon for Cockpit CMS leverages OpenAI's capabilities to enhance user experience for content authors. It offers features like image generation, text optimization, and more, using various OpenAI models such as GPT-3.5-Turbo, GPT-4, etc.

## Configuration

To use this addon, you need to have an OpenAI API key. The API key is crucial for accessing OpenAI's services. Here's how you set it up:

1. **Obtain the API Key:**
   - If you don't already have an OpenAI API key, you need to create an account on the OpenAI website and generate one.

2. **Configure the API Key in Cockpit CMS:**
   - Locate the `/config/config.php` file in your Cockpit installation.
   - Open the `config.php` file in a text editor.
   - Add or update the following configuration snippet:

    ```php
    return [
        // ... existing configurations ...

        'autopilot' => [
            'openAI' => [
                'apiKey' => 'YOUR_OPENAI_API_KEY', // Replace YOUR_OPENAI_API_KEY with your actual OpenAI API key
                'model' => 'gpt-3.5-turbo', // Can be changed to other models like 'gpt-4'
            ]
        ],

        // ... other configurations ...
    ];
    ```

