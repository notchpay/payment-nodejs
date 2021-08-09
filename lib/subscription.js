function Subscription(client, config) {
  if (!(this instanceof Subscription)) {
    return new Subscription(client, config);
  }

  this.config = config;
  this.http = client;
}

Subscription.prototype = {
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
    return await this.http.post("/subscriptions/initialize", form);
  },
  async complete(reference) {
    if (!reference) {
      throw new Error("Subscription reference required");
    }
    return await this.http.get(`/subscriptions/${reference}`);
  },
  async check(reference) {
    if (!reference) {
      throw new Error("Subscription reference required");
    }
    return await this.http.get(`/subscriptions/${reference}`);
  },
  async cancel(reference) {
    if (!reference) {
      throw new Error("Subscription reference required");
    }
    return await this.http.put(`/subscriptions/${reference}`);
  },
};

module.exports = Subscription;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Subscription = Subscription;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Subscription;
