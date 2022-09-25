# Data Sync Prototype

## Setup

``` bash
yarn install --frozen-lockfile
```

## Starting the service

``` bash
yarn start
```

## Tests

There are only two tests covering some main use cases of the service:

* When `user1` makes an edit while `user2` is listening for updates on the document then `user2` will get notified about the changes.
* When `user1` makes some changes to document `A` while `user2` falls behind on updates then `user2` initiates a sync to get all the updates that they were missing.
