# Notch Pay

Nodejs API wrapper for [Notch Pay](https://notchpay.co/).

## Installation and Authentication

```
npm install @notchpay/payment
```

Authenticate

```js
// Require the library
var notchpay = require("@notchpay/payment")("business_key");
```

## Transaction

Allows you to perform transactions on your nodejs and JavaScript applications.

## Initiate

```js
// Initiate transaction
await notchpay
  .transaction()
  .init(500, "usd", {
    name: "Chapdel KAMGA",
    email: "hello@chapdel.me",
  })
  .then((r) => {
    console.log("success", r.data);
  })
  .catch((e) => {
    console.log("error", e);
  });
```

## Check

```js
// Check transaction
await notchpay
  .transaction()
  .check("transaction_reference")
  .then((r) => {
    console.log("success", r.data);
  })
  .catch((e) => {
    console.log("error", e);
  });
```

## Complete

```js
// Complete transaction
await notchpay
  .transaction()
  .complete("transaction_reference", "notchpay", {
    number: 123456789,
    code: 12345,
  })
  .then((r) => {
    console.log("success", r.data);
  })
  .catch((e) => {
    console.log("error", e);
  });
```

## Complete With Window

This method offers you the possibility to complete the transaction in a new window. It is necessary to follow our instructions.

```js
// Complete transaction
await notchpay
  .transaction()
  .complete("transaction_reference", "notchpay", {
    number: 123456789,
    code: 12345,
  })
  .then((r) => {
    var _transaction = notchpay
      .transaction()
      .completeWithWindow(r.data.authorization_url, r.data.transaction);

    var watcher = setInterval(() => {
      console.log(_transaction);
      if (_transaction.status != null && _transaction.status != "pending") {
        clearInterval(watcher);

        // your code here
        /*switch (transaction.status) {

        }*/
      }
    }, 2000);
  })
  .catch((e) => {
    console.log("error", e);
  });
```
