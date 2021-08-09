const DEFAULT_ENDPOINT = "https://api.notchpay.co";

const ALLOWED_CONFIG_PROPERTIES = ["endpoint", "retries", "timeout", "mode"];

Payment.PACKAGE_VERSION = require("../package.json").version;
const request = require("axios");
const Transaction = require(__dirname + "/transaction");
const Subscription = require(__dirname + "/subscription");
const Plan = require(__dirname + "/plan");

function Payment(key, config = {}) {
  if (!(this instanceof Payment)) {
    return new Payment(key, config);
  }

  const props = this._getPropsFromConfig(config);

  this.VERSION = Payment.PACKAGE_VERSION;
  this.businessKey = key;
  this.mode = props.mode || "auto";

  this.config = props;

  this.http = request.create({
    baseURL: DEFAULT_ENDPOINT,
    headers: {
      "N-Authorization": this.businessKey,
    },
    withCredentials: true,
    timeout: props.timeout,
  });
}

Payment.prototype = {
  /**
   * @private
   * This may be removed in the future.
   */
  _getPropsFromConfig(config) {
    // If config is null or undefined, just bail early with no props
    if (!config) {
      return {};
    }

    // config can be an object or a string
    const isObject = config === Object(config) && !Array.isArray(config);

    if (!isObject) {
      throw new Error("Config must either be an object or a string");
    }

    // If config is an object, we assume the new behavior and make sure it doesn't contain any unexpected values
    const values = Object.keys(config).filter(
      (value) => !ALLOWED_CONFIG_PROPERTIES.includes(value)
    );

    if (values.length > 0) {
      throw new Error(
        `Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(
          ", "
        )}`
      );
    }

    return config;
  },

  initSubscription(plan_id, customer) {
    // config can be an object or a string
    const isObject = customer === Object(customer) && !Array.isArray(customer);

    if (!isObject) {
      throw new Error("Customer must either be an object");
    }

    const form = customer;

    form.plan_id = plan_id;

    var subscription = null;
    var subscriptionInterval = null;

    this.http
      .post("/subscriptions/initialize", form)
      .then((r) => {
        subscription = r.data;
        let w = windowOpen(r.data.authorization_url, {
          height: 480,
          name: "Notch Pay",
          width: 640,
          left: (window.outerWidth - 640) / 2,
          top: 160,
        });

        console.log(w);

        subscriptionInterval = window.setInterval(function () {
          if (w.closed) {
            window.clearInterval(subscriptionInterval);
            //validating payment
            this.cancelSubscription();
          }
        }, 500);
      })
      .catch((e) => {
        console.log(e);
      });

    return subscription;
  },

  transaction() {
    return new Transaction(this.http, this.config);
  },

  plan() {
    return new Plan(this.http, this.config);
  },
};

module.exports = Payment;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Payment = Payment;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Payment;
