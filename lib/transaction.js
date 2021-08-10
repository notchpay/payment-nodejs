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
    return await this.http.get(`/verify/${reference}`);
  },
  /**
   * @private
   * @param {*} reference
   * @returns
   */
  async getTransaction(reference) {
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

  completeWithWindow(authorization_url, transaction) {
    if (!authorization_url || !transaction) {
      throw new Error(
        "Transaction authorization_url and reference are required"
      );
    }

    const w = this.openWindow(authorization_url, {
      height: 480,
      name: "Notch Pay",
      width: 640,
      left: (window.outerWidth - 640) / 2,
      top: 160,
    });

    var timeout = null;

    var _event = {};

    var _transaction = new Proxy(_event, {});

    const _http = this.http;

    var _tt = null;

    timeout = setInterval(() => {
      _http
        .get("/verify/" + transaction.reference)
        .then(async (r) => {
          _tt = r.data;
          if (r.data.status != "pending") {
            await w.close();
            clearInterval(timeout);
          }
          _transaction.status = r.data.status;
        })
        .catch(async (e) => {
          _transaction.status = "error";
          clearInterval(timeout);
        });

      if (w.closed) {
        if (_tt != null && _tt.status == "pending") {
          _http.put(`/checkout/${_tt.reference}`);
          _transaction.status = "canceled";
        }
        clearInterval(timeout);
      }
    }, 2500);

    return _transaction;
  },

  /**
   * @private
   * This may be removed in the future.
   */
  openWindow(url, options) {
    var str = this.stringify(this.configure(options));
    var w = window.open(url, options.name || "", str);

    if (w) {
      w.focus();

      return w;
    }

    return false;
  },

  /**
   * @private
   * This may be removed in the future.
   */
  stringify(obj) {
    var parts = [];
    Object.keys(obj).forEach(function (key) {
      parts.push(key + "=" + obj[key]);
    });
    return parts.join(",");
  },

  /**
   * @private
   * This may be removed in the future.
   */
  configure() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var width = options.width || 640;
    var height = options.height || 480;
    return this._extends(
      {
        width: width,
        height: height,
        left: window.screenX + (window.outerWidth - width) / 2,
        top: window.screenY + (window.outerHeight - height) / 2.5,
      },
      options
    );
  },

  /**
   * @private
   */
  _extends(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  },
};

module.exports = Transaction;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Transaction = Transaction;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Transaction;
