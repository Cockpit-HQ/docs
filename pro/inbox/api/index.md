# API & Events

API reference, events system, and permissions for Inbox.

[[toc]]

## API Reference

### Submit Endpoint

```
POST /api/inbox/submit/{token}
```

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data[field]` | mixed | Form field values |
| `success` | string | URL to redirect after successful submission |
| `subject` | string | Custom email subject line |

### Success Response (200)

```json
{
    "success": true,
    "record": {
        "_id": "submission-id",
        "data": {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Hello!"
        },
        "attachments": {},
        "spam": false,
        "_created": 1700000000
    }
}
```

### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 404 | Form not found | Invalid form token |
| 412 | Item data is missing | No `data` fields submitted |
| 412 | Not allowed | Domain restriction failed |
| 412 | Precondition failed | Language detection failed |
| 412 | Upload failed | File upload error |

### Response with Attachments

```json
{
    "success": true,
    "record": {
        "_id": "submission-id",
        "data": {
            "name": "John Doe",
            "email": "john@example.com"
        },
        "attachments": {
            "resume": [
                {
                    "name": "resume.pdf",
                    "file": "inbox/uploads/abc123/2024-01/resume.pdf",
                    "size": 245000,
                    "mime": "application/pdf"
                }
            ]
        },
        "spam": false,
        "_created": 1700000000
    }
}
```

## Events System

Hook into form submissions for custom workflows.

### inbox.submit.before

Triggered before saving the submission. Modify the record or cancel submission.

```php
// config/bootstrap.php
$app->on('inbox.submit.before', function($form, &$record) {

    // Add extra data
    $record['data']['submitted_at'] = date('Y-m-d H:i:s');
    $record['data']['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? null;
    $record['data']['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? null;

    // Cancel submission by throwing exception
    if (someCondition()) {
        throw new \Exception('Submission rejected');
    }
});
```

### inbox.submit.after

Triggered after the submission is saved. Use for integrations.

```php
$app->on('inbox.submit.after', function($form, $record) use ($app) {

    // Send to CRM
    $app->helper('async')->run(function() use ($record) {
        $client = new \GuzzleHttp\Client();
        $client->post('https://crm.example.com/api/leads', [
            'json' => $record['data']
        ]);
    });

    // Log submission
    $app->module('system')->log(
        "New submission: {$form['name']}",
        channel: 'inbox',
        type: 'info'
    );
});
```

## Event Examples

### Slack Notification

```php
$app->on('inbox.submit.after', function($form, $record) {

    $webhookUrl = $_ENV['SLACK_WEBHOOK_URL'];

    $message = [
        'text' => "New {$form['name']} submission",
        'blocks' => [
            [
                'type' => 'section',
                'text' => [
                    'type' => 'mrkdwn',
                    'text' => "*New Submission*\n" .
                              "From: {$record['data']['name']}\n" .
                              "Email: {$record['data']['email']}"
                ]
            ]
        ]
    ];

    file_get_contents($webhookUrl, false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($message)
        ]
    ]));
});
```

### Save to External Database

```php
$app->on('inbox.submit.after', function($form, $record) use ($app) {

    // Only for specific form
    if ($form['name'] !== 'Newsletter Signup') return;

    $pdo = new PDO('mysql:host=localhost;dbname=myapp', 'user', 'pass');

    $stmt = $pdo->prepare('INSERT INTO subscribers (email, name, created) VALUES (?, ?, NOW())');
    $stmt->execute([
        $record['data']['email'],
        $record['data']['name']
    ]);
});
```

### Conditional Processing

```php
$app->on('inbox.submit.after', function($form, $record) use ($app) {

    // Route based on form type
    switch ($form['group']) {
        case 'Support':
            // Create support ticket
            createSupportTicket($record);
            break;

        case 'Sales':
            // Add to CRM
            addToCRM($record);
            break;

        case 'Marketing':
            // Add to mailing list
            addToMailingList($record);
            break;
    }
});
```

### Data Validation

```php
$app->on('inbox.submit.before', function($form, &$record) {

    // Validate email domain
    $email = $record['data']['email'] ?? '';
    $domain = substr(strrchr($email, '@'), 1);

    $blockedDomains = ['tempmail.com', 'throwaway.com'];

    if (in_array($domain, $blockedDomains)) {
        throw new \Exception('Disposable email addresses not allowed');
    }

    // Normalize phone number
    if (isset($record['data']['phone'])) {
        $record['data']['phone'] = preg_replace('/[^0-9+]/', '', $record['data']['phone']);
    }
});
```

## Permissions

Control Inbox access through roles:

| Permission | Description |
|------------|-------------|
| `inbox/manage` | Create, edit, and delete forms |
| `inbox/submissions` | View and manage submissions |

### Configure in Roles

Navigate to **Settings > Roles** and assign permissions:

```php
// Example role configuration
[
    'name' => 'Content Editor',
    'permissions' => [
        'inbox/submissions' => true,  // Can view submissions
        'inbox/manage' => false       // Cannot create/edit forms
    ]
]
```

## Programmatic Access

### List Forms

```php
$forms = $app->dataStorage->find('inbox/forms')->toArray();
```

### Get Submissions

```php
$submissions = $app->dataStorage->find('inbox/submissions', [
    'filter' => ['form' => $formId],
    'sort' => ['_created' => -1],
    'limit' => 50
])->toArray();
```

### Create Submission Programmatically

```php
$record = [
    'form' => $formId,
    'data' => [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Hello!'
    ],
    'attachments' => [],
    'spam' => false,
    '_created' => time()
];

$app->dataStorage->save('inbox/submissions', $record);
```

### Delete Old Submissions

```php
// Delete submissions older than 90 days
$cutoff = strtotime('-90 days');

$app->dataStorage->remove('inbox/submissions', [
    '_created' => ['$lt' => $cutoff]
]);
```

## Export Submissions

### Export to CSV

```php
$submissions = $app->dataStorage->find('inbox/submissions', [
    'filter' => ['form' => $formId]
])->toArray();

$csv = fopen('php://output', 'w');
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="submissions.csv"');

// Header row
fputcsv($csv, ['Name', 'Email', 'Message', 'Date']);

// Data rows
foreach ($submissions as $sub) {
    fputcsv($csv, [
        $sub['data']['name'] ?? '',
        $sub['data']['email'] ?? '',
        $sub['data']['message'] ?? '',
        date('Y-m-d H:i:s', $sub['_created'])
    ]);
}

fclose($csv);
```
