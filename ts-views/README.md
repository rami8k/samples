# app-views

## Overview

app service for users read history and popular articles.

Infrastructure is build with terraform and deployed into AWS.

This app is intended to run as a lamba but can be run and tested locally as it uses `expressjs` under the hood.

## Using The App
The app is built in node and typescript and can be run and tested locally.

Install dependencies
```
$ yarn
```

As the application is intended to be used in the cloud it contains multiple lambda packages to be build, packaged and deployed. To reduce lambda package sizes we use `lerna` to connect lambda packages with core services within the source code.

Bootstrap local dependecies
```
$ yarn bootstrap
```

Run local
```
$ yarn serve
```

To be able to call AWS services make sure to add authentication keys and token to AWS service object instantiation.
ex:
```
const dynamoDbClient = new DynamoDB({ 
    region: process.env.AWS_REGION,
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
    sessionToken: 'xxx
})
```

Please take a look at the `package.json` to get an understanding of how the lambda's are being build and packaged.


## Available Endpoints

| endpoint         | method  | description                                   |
| ---------------- |---------| --------------------------------------------- |
| healthcheck      | get     | used for rout53/newrelic healthcheck          |
| /event           | post    | send article view event                       |
| /user/history    | post    | returns user views history                    |
| /popular         | post    | returns most popular articles cross the site  |
| /popular/channel | post    | returns most popular articles cross a channel |

## License
----
