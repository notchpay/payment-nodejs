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
    console.log("success", r);
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
    console.log("success", r);
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
    console.log("success", r);
  })
  .catch((e) => {
    console.log("error", e);
  });
```
