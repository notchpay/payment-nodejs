function Plan(client, config) {
  if (!(this instanceof Plan)) {
    return new Plan(client, config);
  }

  this.config = config;
  this.http = client;
}

Plan.prototype = {
  async create(plan) {
    // config can be an object or a string
    const isObject = plan === Object(plan) && !Array.isArray(plan);

    if (!isObject) {
      throw new Error("Plan must either be an object");
    }

    if (!plan.name || !plan.price || !plan.interval || !plan.currency) {
      throw new Error(
        "plan must have name, price, currency, interval attribute"
      );
    }

    return await this.http.post("/plans", plan);
  },

  async update(plan_id, plan) {
    if (!plan_id) {
      throw new Error("Plan id required");
    }
    // config can be an object or a string
    const isObject = plan === Object(plan) && !Array.isArray(plan);

    if (!isObject) {
      throw new Error("Plan must either be an object");
    }

    if (!plan.name || !plan.price || !plan.interval || !plan.currency) {
      throw new Error(
        "plan must have name, price, currency, interval attribute"
      );
    }

    return await this.http.put(`/plans/${plan_id}`, plan);
  },
  async fetch(plan_id) {
    if (!plan_id) {
      throw new Error("Plan id required");
    }
    return await this.http.get(`/plans/${plan_id}`);
  },
  async list() {
    return await this.http.get(`/plans`);
  },
  async delete(plan_id) {
    if (!plan_id) {
      throw new Error("Plan id required");
    }
    return await this.http.delete(`/plans/${plan_id}`);
  },
};

module.exports = Plan;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Plan = Plan;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Plan;
