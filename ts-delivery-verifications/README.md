# Email Delivery Verification

One stop shop to verify your emails/newsletters are delivered to your mailbox after the your delivery task has been triggered.

## Stack:
* TypeScript
* Monorepo using Lerna 
* Terraform
* CI/CD in gitlab
* AWS

## How it  works

To verify that an email was delivered to a mailbox we need to read the emails in that mailbox and verify that our intended email exists.
Email providers like Gmail and Outlook won't allow us to just read anybody's mailbox, so the mailbox owner has to give us permissions. So we have to build an application in the email provider correspoding cloud platform, and ask the mailbox owner to give the application the permissions needed to read their mailbox.

## The setup(registering yourself in our database):

One time setup
1. You need to create and login to an email account (we currently support Gmail, Outlook), make sure this email purpose only is just to verify that an email was delivered.
2. Subscribe your newly created email to your newsletter (ex: a BU channel newsletter)
3. Make a post request to our `/authorize` endpoint with a unique app-name, ex: BU-newsletters (endpoint details below), the endpoint will redirect you to your email account and ask you to give us permissions to read your mailbox.
4. After you give your consent it will redirect you back to a callback endpoint `/auth_callback/app-name?token=1234`, replace app-name with the unique app-name you choosen in the previous step and hit enter. For technical details on why please read endpoint description below.
5. Your setup is done.

## Email delivery verification:
Whenever your newsletter is triggered for delivery you will call our `/validate` endpoint with a json containing details about the emails you are expecting in your mailbox, the endpoint will return a detailed status message about each email in the list you sent.

## Endpoints

### post /authorize

Asks email owner to give our application permission to read their mailbox.
How it works:
We registered this application in every email providers corresponding cloud platform, when this endpoint is called it requests an auth url from the email provider, the browser redirects to that auth url which will open a browser page asking the currently logged in email owner to give our registered application the requested permissions to read their mailbox(in this case your email you created in the setup procedure).
After you give the permissions the browser will redirect you back to our callback endpoint.

example request: 
```
{
    "appKey": "BU-newsletter", //unique app name of your choice
    "provider": "Gmail"         //the email provider you will use(Case sensetive, Gmail or Outlook)
}
```

### get /callback/app-name

You will be redirected automatically to this endpoint after you give permissions to the app to read your mailbox.
One thing to notice is the app-name in the path, due to limitations in email providers cloud platform settings callback urls can't be dynamic so we can't redirect back to for example `/callback/BU-newsletter` which is the app name we chosen in the authorize request.
So you have to manually change `app-name` to your application name(ex: `BU-newsletter` in this case) and hit enter.

Now your application is registered in our database and no further setup is needed, we will save the credentials sent back along the callback endpoint for email verification procedure.

### post /validate

Validates a list of emails against your mailbox, it will read newly delivered emails for subjects matching the list. Further more it can validate the emails against a custom validation endpoint you can provide with the request.
After the validation procedure is done it will mark the found emails as deleted.

ex request:
```
{
    "appKey": "BU-newsletter",    //your unique application name
    "provider": "Gmail",            //the email provider(case sensitive)
    "gracePeriod": 0,               //if you think your emails will take x seconds to be delivered
    "customValidationEndpoint": "", //a custom endpoint to further validate delivered emails against(more below)
    "inputEmails": [
        {
            "subject": "email 1",       //email subject to look for
            "sender": "BU@domain.com"  //sender email to match
        }
    ]
}
```

`customValidationEndpoint` is an endpoint you provide if you want to further validate an email if delivered, for example validate the email body with a custom procedure of your own. The application will call your endpoint with the email details and wait for a response.

ex: request
```
[
    {
        id: string
        subject: string
        sender: string
        body: string
    }
]
```

we expect a response:
```
[
    {
        id: string
        status: boolean
    }
]
```

## Archeticute diagram

![Alt text](docs/archetictural_diagram.jpg "archetictural diagram")

## License
----
