const DEFAULT_ENDPOINT = "https://api.notchpay.co";

const ALLOWED_CONFIG_PROPERTIES = ["endpoint", "retries", "timeout", "mode"];

Payment.PACKAGE_VERSION = require("../package.json").version;
const request = require("axios");
const Transaction = require("./transaction");
const Subscription = require("./subscription");
const Plan = require("./plan");

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
  transaction() {
    return new Transaction(this.http, this.config);
  },

  plan() {
    return new Plan(this.http, this.config);
  },
  subscription() {
    return new Subscription(this.http, this.config);
  },
};

module.exports = Payment;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Payment = Payment;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Payment;
