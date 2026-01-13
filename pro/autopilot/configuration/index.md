# Configuration

Configure Autopilot with your AI service credentials and customize model settings.

[[toc]]

## Supported AI Services

Autopilot supports **any AI service that implements the OpenAI REST API endpoints**. This includes:

- **OpenAI** - GPT-4o, GPT-4o-mini, GPT-4-turbo
- **Azure OpenAI** - Microsoft's hosted OpenAI models
- **Anthropic** - Claude models (via OpenAI-compatible proxy)
- **Google AI** - Gemini models (via OpenAI-compatible proxy)
- **Groq** - Fast inference for Llama, Mixtral, Gemma
- **Together AI** - Wide selection of open models
- **Mistral AI** - Mistral and Mixtral models
- **Perplexity** - Online models with web search
- **OpenRouter** - Multi-provider gateway
- **Ollama** - Local open-source models
- **LocalAI** - Self-hosted open-source models
- **LM Studio** - Local model runner
- **vLLM** - High-performance local inference

The available models depend entirely on which service you configure.

## Basic Configuration

Add your AI service configuration to `/config/config.php`:

```php
<?php

return [
    'autopilot' => [
        'openAI' => [
            'apiKey' => 'your-api-key',
            'chatModel' => 'gpt-4o',  // Model name from your provider
        ],
        'tools' => true
    ]
];
```

## Using Environment Variables

For better security, use environment variables:

```php
<?php

return [
    'autopilot' => [
        'openAI' => [
            'apiKey' => $_ENV['AI_API_KEY'],
            'chatModel' => $_ENV['AI_MODEL'] ?? 'gpt-4o-mini',
            'baseUri' => $_ENV['AI_BASE_URI'] ?? null,
        ]
    ]
];
```

Set in your `.env` file:

```
AI_API_KEY=your-api-key
AI_MODEL=gpt-4o
AI_BASE_URI=https://api.openai.com/v1
```

## Provider Examples

### OpenAI

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['OPENAI_API_KEY'],
        'chatModel' => 'gpt-4o',  // or gpt-4o-mini, gpt-4-turbo
    ]
]
```

### Azure OpenAI

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['AZURE_OPENAI_KEY'],
        'baseUri' => 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
        'chatModel' => 'your-deployment-name'
    ]
]
```

### Groq

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['GROQ_API_KEY'],
        'baseUri' => 'https://api.groq.com/openai/v1',
        'chatModel' => 'llama-3.3-70b-versatile'  // or mixtral-8x7b-32768
    ]
]
```

### Together AI

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['TOGETHER_API_KEY'],
        'baseUri' => 'https://api.together.xyz/v1',
        'chatModel' => 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
    ]
]
```

### Mistral AI

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['MISTRAL_API_KEY'],
        'baseUri' => 'https://api.mistral.ai/v1',
        'chatModel' => 'mistral-large-latest'  // or mistral-small-latest
    ]
]
```

### OpenRouter

Access multiple providers through a single API:

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['OPENROUTER_API_KEY'],
        'baseUri' => 'https://openrouter.ai/api/v1',
        'chatModel' => 'anthropic/claude-3.5-sonnet'  // or any supported model
    ]
]
```

### Perplexity

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => $_ENV['PERPLEXITY_API_KEY'],
        'baseUri' => 'https://api.perplexity.ai',
        'chatModel' => 'llama-3.1-sonar-large-128k-online'
    ]
]
```

## Self-Hosted / Local Models

### Ollama

Run models locally with Ollama:

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => 'ollama',  // Can be any value
        'baseUri' => 'http://localhost:11434/v1',
        'chatModel' => 'llama3.2'  // or mistral, codellama, etc.
    ]
]
```

### LocalAI

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => 'not-required',
        'baseUri' => 'http://localhost:8080/v1',
        'chatModel' => 'gpt-4'  // Model name as configured in LocalAI
    ]
]
```

### LM Studio

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => 'lm-studio',
        'baseUri' => 'http://localhost:1234/v1',
        'chatModel' => 'local-model'
    ]
]
```

### vLLM

```php
'autopilot' => [
    'openAI' => [
        'apiKey' => 'not-required',
        'baseUri' => 'http://localhost:8000/v1',
        'chatModel' => 'meta-llama/Llama-3.2-3B-Instruct'
    ]
]
```

## Model Selection Guide

The best model depends on your use case and provider:

### For Complex Tasks
- OpenAI: `gpt-4o`
- Anthropic (via proxy): `claude-3.5-sonnet`
- Groq: `llama-3.3-70b-versatile`
- Together: `meta-llama/Llama-3.3-70B-Instruct-Turbo`

### For Fast, Cost-Effective Tasks
- OpenAI: `gpt-4o-mini`
- Groq: `llama-3.1-8b-instant`
- Together: `meta-llama/Llama-3.2-3B-Instruct-Turbo`

### For Local/Private Deployment
- Ollama: `llama3.2`, `mistral`, `codellama`
- LocalAI: Various open models
- LM Studio: Any GGUF model

## Full Configuration Example

```php
<?php

return [
    'autopilot' => [
        'openAI' => [
            // API credentials
            'apiKey' => $_ENV['AI_API_KEY'],

            // Model selection (depends on your provider)
            'chatModel' => $_ENV['AI_MODEL'] ?? 'gpt-4o-mini',

            // Custom endpoint for non-OpenAI providers
            'baseUri' => $_ENV['AI_BASE_URI'] ?? null,
        ]
    ]
];
```

## Configuration Options

| Option | Description |
|--------|-------------|
| `apiKey` | API key from your AI provider |
| `chatModel` | Model identifier (varies by provider) |
| `baseUri` | API endpoint URL (required for non-OpenAI providers) |

:::tip
Check your AI provider's documentation for available models and their capabilities. Model names and features vary significantly between providers.
:::
