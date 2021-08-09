function Transaction(client, config) {
  if (!(this instanceof Transaction)) {
    return new Transaction(client, config);
  }

  this.config = config;
  this.http = client;
}

Transaction.prototype = {
  async init(amount, currency, customer) {
    // config can be an object or a string
    const isObject = customer === Object(customer) && !Array.isArray(customer);

    if (!isObject) {
      throw new Error("Customer must either be an object");
    }

    if (!customer.email && !customer.phone) {
      throw new Error("Customer must have email, phone attribute");
    }

    const form = customer;

    form.amount = amount;
    form.currency = currency;
    return await this.http.post("/checkout/initialize", form);
  },
  async complete(reference, gateway, data) {
    if (!reference) {
      throw new Error("Transaction reference required");
    }

    if (!gateway) {
      throw new Error("Transaction gateway required");
    }

    // config can be an object or a string
    const isObject = data === Object(data) && !Array.isArray(data);

    if (!isObject) {
      throw new Error("Payment data must either be an object");
    }

    const form = { gateway: gateway };
    form.data = data;
    return await this.http.post(`/checkout/${reference}`, form);
  },
  async check(reference) {
    if (!reference) {
      throw new Error("Transaction reference required");
    }
    return await this.http.get(`/checkout/${reference}`);
  },
  async cancel(reference) {
    if (!reference) {
      throw new Error("Transaction reference required");
    }
    return await this.http.put(`/checkout/${reference}`);
  },
};

module.exports = Transaction;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Transaction = Transaction;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Transaction;
