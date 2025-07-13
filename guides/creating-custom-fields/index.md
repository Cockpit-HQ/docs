# Creating Custom Fields

Learn how to create custom field types for Cockpit CMS content models.

[[toc]]

## Overview

Cockpit CMS allows you to create custom field types to extend the content modeling capabilities. Custom fields are Vue.js components that integrate seamlessly with the content management interface.

## Field Structure

Custom fields are Vue.js components that follow a specific structure and use the Vue 3 Composition API pattern.

### Basic Field Template

```javascript
export default {
    _meta: {
        label: 'Your Field Name',
        info: 'Description of your field',
        icon: 'path/to/icon.svg',
        settings: [
            // Field configuration options
        ],
        render(value, field, context) {
            // How to display the field value in lists/tables
            return value;
        }
    },

    data() {
        return {
            val: this.modelValue
        }
    },

    props: {
        modelValue: {
            type: String, // or Number, Array, Object, etc.
            default: ''
        },
        // Additional field-specific props
    },

    watch: {
        modelValue() {
            this.val = this.modelValue;
            this.update();
        }
    },

    methods: {
        update() {
            this.$emit('update:modelValue', this.val)
        }
    },

    template: /*html*/`
        <div field="your-field-type">
            <!-- Your field HTML -->
        </div>
    `
}
```

## Field Metadata (_meta)

The `_meta` object defines the field's properties and configuration:

### Required Properties

- **`label`**: Display name for the field type
- **`info`**: Brief description of the field's purpose
- **`icon`**: Path to SVG icon (relative to module or absolute)

### Settings Configuration

The `settings` array defines configurable options for your field:

```javascript
settings: [
    {
        name: 'placeholder',        // Setting key
        type: 'text',              // Setting field type
        opts: {default: 'Enter text...'} // Default value and options
    },
    {
        name: 'maxlength',
        type: 'number',
        opts: {default: 255}
    },
    {
        name: 'readonly',
        type: 'boolean',
        opts: {default: false}
    },
    {
        name: 'options',
        type: 'text',
        multiple: true,            // Allow multiple values
        info: 'List of available options'
    }
]
```

### Render Function

The `render()` function controls how field values are displayed in content lists:

```javascript
render(value, field, context) {
    // value: The field's current value
    // field: Field configuration object
    // context: Where it's being rendered ('table-cell', 'preview', etc.)

    if (context === 'table-cell' && value.length > 50) {
        return App.utils.truncate(value, 50);
    }

    return value;
}
```

## Example: Rating Field

Here's a complete example of a custom rating field:

```javascript
let instanceCount = 0;

export default {
    _meta: {
        label: 'Rating',
        info: 'Star rating input',
        icon: 'system:assets/icons/star.svg',
        settings: [
            {name: 'max', type: 'number', opts: {default: 5}},
            {name: 'readonly', type: 'boolean', opts: {default: false}},
            {name: 'showValue', type: 'boolean', opts: {default: true}},
        ],
        render(value, field, context) {
            if (!value) return '';

            const max = field.opts?.max || 5;
            const stars = '★'.repeat(value) + '☆'.repeat(max - value);

            return context === 'table-cell'
                ? `${stars} (${value}/${max})`
                : value;
        }
    },

    data() {
        return {
            uid: `field-rating-${++instanceCount}`,
            val: this.modelValue || 0
        }
    },

    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 5
        },
        readonly: {
            type: Boolean,
            default: false
        },
        showValue: {
            type: Boolean,
            default: true
        }
    },

    watch: {
        modelValue() {
            this.val = this.modelValue || 0;
        }
    },

    methods: {
        setRating(rating) {
            if (this.readonly) return;
            this.val = rating;
            this.update();
        },

        update() {
            this.$emit('update:modelValue', this.val);
        }
    },

    template: /*html*/`
        <div field="rating" class="rating-field">
            <div class="stars" :class="{'readonly': readonly}">
                <span
                    v-for="star in max"
                    :key="star"
                    class="star"
                    :class="{'active': star <= val, 'clickable': !readonly}"
                    @click="setRating(star)"
                    @mouseover="!readonly && (hoverRating = star)"
                    @mouseleave="!readonly && (hoverRating = 0)"
                >
                    ★
                </span>
            </div>
            <span v-if="showValue" class="rating-value">{{ val }}/{{ max }}</span>

            <style scoped>
                .rating-field {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .stars {
                    display: flex;
                    gap: 2px;
                }
                .star {
                    font-size: 20px;
                    color: #ddd;
                    transition: color 0.2s;
                }
                .star.active {
                    color: #ffc107;
                }
                .star.clickable {
                    cursor: pointer;
                }
                .star.clickable:hover {
                    color: #ffeb3b;
                }
                .rating-value {
                    font-size: 14px;
                    color: #666;
                }
                .readonly .star {
                    cursor: default;
                }
            </style>
        </div>
    `
}
```

## Field Registration

### In Addons

Register your custom field in your addon's bootstrap or admin file:

```php
// In admin.php or bootstrap.php
$this->on('app.layout.init', function() {

    // Register the field component
    $this->script([
        'youraddon:assets/vue-components/field-rating.js'
    ], 'youraddon-fields');

});
```

### Directory Structure

```
YourAddon/
|-- assets/
|   `-- vue-components/
|       `-- field-rating.js
```

## Advanced Field Examples

### File Picker Field

```javascript
export default {
    _meta: {
        label: 'File Picker',
        info: 'Select files from the file system',
        icon: 'system:assets/icons/file.svg',
        settings: [
            {name: 'extensions', type: 'text', multiple: true, info: 'Allowed file extensions'},
            {name: 'multiple', type: 'boolean', opts: {default: false}},
        ],
        render(value, field, context) {
            if (!value) return '';

            if (Array.isArray(value)) {
                return `${value.length} files selected`;
            }

            return value.name || value;
        }
    },

    data() {
        return {
            val: this.modelValue,
            files: []
        }
    },

    props: {
        modelValue: {
            default: null
        },
        extensions: {
            type: Array,
            default: []
        },
        multiple: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        openFileDialog() {
            // Open Cockpit's file picker dialog
            App.dialogs.files({
                extensions: this.extensions,
                multiple: this.multiple
            }).then(files => {
                this.val = this.multiple ? files : files[0];
                this.update();
            });
        },

        update() {
            this.$emit('update:modelValue', this.val);
        }
    },

    template: /*html*/`
        <div field="file-picker">
            <button type="button" class="kiss-button" @click="openFileDialog">
                <icon>attach_file</icon>
                Select File{{ multiple ? 's' : '' }}
            </button>

            <div v-if="val" class="selected-files">
                <div v-if="multiple && Array.isArray(val)">
                    <div v-for="file in val" :key="file.name" class="file-item">
                        {{ file.name }}
                    </div>
                </div>
                <div v-else class="file-item">
                    {{ val.name || val }}
                </div>
            </div>
        </div>
    `
}
```

### JSON Editor Field

```javascript
export default {
    _meta: {
        label: 'JSON Editor',
        info: 'Advanced JSON data editor',
        icon: 'system:assets/icons/code.svg',
        settings: [
            {name: 'height', type: 'text', opts: {default: '200px'}},
            {name: 'readonly', type: 'boolean', opts: {default: false}},
        ],
        render(value, field, context) {
            if (!value) return '';

            return context === 'table-cell'
                ? '{ JSON Object }'
                : JSON.stringify(value);
        }
    },

    data() {
        return {
            val: this.modelValue,
            textValue: '',
            isValid: true
        }
    },

    props: {
        modelValue: {
            default: null
        },
        height: {
            type: String,
            default: '200px'
        },
        readonly: {
            type: Boolean,
            default: false
        }
    },

    mounted() {
        this.textValue = this.val ? JSON.stringify(this.val, null, 2) : '';
    },

    watch: {
        modelValue() {
            this.val = this.modelValue;
            this.textValue = this.val ? JSON.stringify(this.val, null, 2) : '';
        }
    },

    methods: {
        updateValue() {
            try {
                this.val = this.textValue ? JSON.parse(this.textValue) : null;
                this.isValid = true;
                this.update();
            } catch (e) {
                this.isValid = false;
            }
        },

        update() {
            this.$emit('update:modelValue', this.val);
        }
    },

    template: /*html*/`
        <div field="json-editor">
            <textarea
                v-model="textValue"
                @input="updateValue"
                class="kiss-textarea kiss-input kiss-width-1-1"
                :class="{'kiss-color-danger': !isValid}"
                :style="{height: height}"
                :readonly="readonly"
                placeholder="Enter valid JSON..."
            ></textarea>
            <div v-if="!isValid" class="kiss-color-danger kiss-size-small">
                Invalid JSON format
            </div>
        </div>
    `
}
```

## Best Practices

### 1. Use Unique Instance IDs
```javascript
let instanceCount = 0;

data() {
    return {
        uid: `field-yourtype-${++instanceCount}`,
        val: this.modelValue
    }
}
```

### 2. Handle Reactive Updates
```javascript
watch: {
    modelValue() {
        this.val = this.modelValue;
        this.update();
    }
}
```

### 3. Provide Meaningful Render Output
```javascript
render(value, field, context) {
    if (!value) return '';

    // Different display for different contexts
    if (context === 'table-cell') {
        return App.utils.truncate(String(value), 50);
    }

    return String(value);
}
```

### 4. Validate Input Data
```javascript
methods: {
    validate() {
        // Validate your field's value
        if (this.required && !this.val) {
            return false;
        }
        return true;
    },

    update() {
        if (this.validate()) {
            this.$emit('update:modelValue', this.val);
        }
    }
}
```

### 5. Handle Multiple Values
```javascript
props: {
    modelValue: {
        default: null
    }
},

computed: {
    isMultiple() {
        return Array.isArray(this.modelValue);
    }
}
```

## Integration with Cockpit APIs

### Using Cockpit Helpers

```javascript
methods: {
    loadData() {
        // Access Cockpit's API
        fetch(App.route('/api/content/items/your-model'))
            .then(response => response.json())
            .then(data => {
                this.options = data;
            });
    }
}
```

### Asset Integration

```javascript
methods: {
    selectAsset() {
        // Open asset picker
        App.dialogs.assets({
            multiple: false,
            type: 'image'
        }).then(assets => {
            this.val = assets[0];
            this.update();
        });
    }
}
```

## Testing Your Field

1. **Create a test content model** with your custom field
2. **Test different configurations** using the field settings
3. **Verify data persistence** by saving and reloading content
4. **Check responsive display** in different screen sizes
5. **Validate render output** in content lists and tables

## Troubleshooting

### Common Issues

1. **Field not appearing**: Check that the JavaScript file is properly loaded
2. **Settings not working**: Verify the settings array structure
3. **Value not saving**: Ensure the `update()` method emits the correct event
4. **Render errors**: Handle null/undefined values in the render function

## Next Steps

- Review existing field implementations in `/cockpit/modules/App/assets/vue-components/fields/`
- Test your fields with different content models
- Consider creating field presets for common configurations
- Document your field's usage for other developers

Custom fields extend Cockpit's flexibility, allowing you to create exactly the content editing experience you need.