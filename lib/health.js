// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * Actuator health indicator and endpoints.
 *
 * Portated from
 * [Spring Boot's health package](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/actuate/health/package-summary.html).
 *
 * @module
 */

import { assertNotNull } from './assert.js';

/**
 * Express state of a component.
 */
export class Status {
  /**
   * Indicates the component is in an unknown state.
   *
   * @type {Status}
   */
  static UNKNOWN = new Status('UNKNOWN');

  /**
   * Indicates the component is functioning as expected
   *
   * @type {Status}
   */
  static UP = new Status('UP');

  /**
   *  Indicates the component has suffered an unexpected failure.
   *
   * @type {Status}
   */
  static DOWN = new Status('DOWN');

  /**
   *  Indicates the component has been taken out of service and should not be used.
   *
   * @type {Status}
   */
  static OUT_OF_SERVICE = new Status('OUT_OF_SERVICE');

  /**
   * Creates a new status.
   *
   * @param {string} code The status code.
   */
  constructor(code) {
    assertNotNull(code, 'Code must not be null.');
    this.code = code;
  }

  /**
   * Returns a string representation of the status.
   *
   * @return {string} The status code.
   */
  toString() {
    return this.code;
  }

  /**
   * Returns the value of the status.
   *
   * @return {string} The status code.
   */
  valueOf() {
    return this.code;
  }

  /**
   * Returns the status code.
   *
   * @return {string} The status code.
   */
  toJSON() {
    return this.code;
  }
}

/**
 * Carry information about the health of a component.
 */
export class Health {
  /**
   * Creates a new health object with status {@link Status.UNKNOWN}.
   *
   * @param {object} options The health options.
   * @param {Record<string, *>} [options.details] The details of the health.
   */
  static unknown({ details } = {}) {
    return Health.status({ status: Status.UNKNOWN, details });
  }

  /**
   * Creates a new health object with status {@link Status.UP}.
   *
   * @param {object} options The health options.
   * @param {Record<string, *>} [options.details] The details of the health.
   */
  static up({ details } = {}) {
    return Health.status({ status: Status.UP, details });
  }

  /**
   * Creates a new health object with status {@link Status.DOWN}.
   *
   * @param {object} options The health options.
   * @param {Record<string, *>} [options.details] The details of the health.
   * @param {Error} [options.error] The error of the health.
   */
  static down({ details, error } = {}) {
    return Health.status({ status: Status.DOWN, details, error });
  }

  /**
   * Creates a new health object with status {@link Status.OUT_OF_SERVICE}.
   *
   * @param {object} options The health options.
   * @param {Record<string, *>} [options.details] The details of the health.
   */
  static outOfService({ details } = {}) {
    return Health.status({ status: Status.OUT_OF_SERVICE, details });
  }

  /**
   * Creates a new health object.
   *
   * @param {object} options The health options.
   * @param {Status} options.status The status of the health.
   * @param {Record<string, *>} [options.details] The details of the health.
   * @param {Error} [options.error] The error of the health.
   */
  static status({ status = Status.UNKNOWN, details, error } = {}) {
    if (error) {
      details = { ...details, error: `${error.name}: ${error.message}` };
    }
    return new Health(status, details);
  }

  /**
   * The status of the health.
   *
   * @type {Status}
   */
  status;

  /**
   * The details of the health.
   *
   * @type {?Record<string, *>}
   */
  details;

  /**
   * Creates a new health object.
   *
   * @param {Status} status The status of the health.
   * @param {Record<string, *>} details The details of the health.
   */
  constructor(status, details) {
    assertNotNull(status, 'Status must not be null.');
    // TODO assertNotNull(details, 'Details must not be null.');

    this.status = status;
    this.details = details;
  }
}

/**
 * A {@link Health} that is composed of other {@link Health} instances.
 */
export class CompositeHealth {
  /**
   * The status of the component.
   *
   * @type {Status}
   */
  status;

  /**
   * The components of the health.
   *
   * @type {?Record<string, Health|CompositeHealth>}
   */
  components;

  /**
   * Creates a new composite health object.
   *
   * @param {Status} status The combined status of the components.
   * @param {Record<string, Health|CompositeHealth>} [components] The components.
   */
  constructor(
    /** @type {Status} */ status,
    /** @type {?Record<string, Health|CompositeHealth>} */ components,
  ) {
    assertNotNull(status, 'Status must not be null.');

    this.status = status;
    this.components = components;
  }
}

/**
 * Strategy interface used to contribute {@link Health} to the results returned
 * from the {@link HealthEndpoint}.
 *
 * @typedef {object} HealthIndicator
 * @property {function(): Health} health Returns the health of the component.
 */

/**
 * A named {@link HealthIndicator}.
 *
 * @typedef {object} NamedContributor
 * @property {string} name The name of the contributor.
 * @property {HealthIndicator} contributor The contributor.
 */

/**
 * A registry of {@link HealthIndicator} instances.
 */
export class HealthContributorRegistry {
  static #instance = new HealthContributorRegistry();

  /**
   * Returns the default registry.
   *
   * @return {HealthContributorRegistry} The default registry.
   */
  static getDefault() {
    return HealthContributorRegistry.#instance;
  }

  #contributors;

  /**
   * Creates a new registry.
   *
   * @param {Map<string, HealthIndicator>} [contributors] The initial
   *   contributors.
   */
  constructor(contributors) {
    this.#contributors = contributors ?? new Map();
  }

  /**
   * Registers a contributor.
   *
   * @param {string} name The name of the contributor.
   * @param {HealthIndicator} contributor The contributor.
   */
  registerContributor(name, contributor) {
    this.#contributors.set(name, contributor);
  }

  /**
   * Unregisters a contributor.
   *
   * @param {string} name The name of the contributor.
   */
  unregisterContributor(name) {
    this.#contributors.delete(name);
  }

  /**
   * Returns a contributor by name.
   *
   * @param {string} name The name of the contributor.
   * @return {HealthIndicator} The contributorm or `undefined` if not found.
   */
  getContributor(name) {
    return this.#contributors.get(name);
  }

  /**
   * Returns an iterator over the named contributors.
   *
   * @return {IterableIterator<NamedContributor>} The iterator.
   */
  *[Symbol.iterator]() {
    for (const [name, contributor] of this.#contributors) {
      yield { name, contributor };
    }
  }
}

/**
 * Strategy interface used to aggregate multiple {@link Status} instances into a
 * single one.
 */
export class StatusAggregator {
  /**
   * Returns the default status aggregator.
   *
   * @return {StatusAggregator} The default status aggregator.
   */
  static getDefault() {
    return SimpleStatusAggregator.INSTANCE;
  }

  /**
   * Returns the aggregate status of the given statuses.
   *
   * @param {Status[]} statuses The statuses to aggregate.
   * @return {Status} The aggregate status.
   * @abstract
   */
  getAggregateStatus(_statuses) {
    throw new Error('Method not implemented.');
  }
}

/**
 * A simple {@link StatusAggregator} that uses a predefined order to determine
 * the aggregate status.
 *
 * @extends StatusAggregator
 */
export class SimpleStatusAggregator extends StatusAggregator {
  static #DEFAULT_ORDER = [
    Status.DOWN,
    Status.OUT_OF_SERVICE,
    Status.UP,
    Status.UNKNOWN,
  ];

  static INSTANCE = new SimpleStatusAggregator();

  #order;

  /**
   * Creates a new aggregator.
   *
   * @param {Status[]} order The order of the statuses.
   */
  constructor(order = SimpleStatusAggregator.#DEFAULT_ORDER) {
    super();
    this.#order = order;
  }

  /** @override */
  getAggregateStatus(statuses) {
    if (statuses.length === 0) {
      return Status.UNKNOWN;
    }

    statuses.sort((a, b) => this.#order.indexOf(a) - this.#order.indexOf(b));
    return statuses[0];
  }
}

/**
 * Strategy interface used to map {@link Status} instances to HTTP status codes.
 */
export class HttpCodeStatusMapper {
  /**
   * Returns the default HTTP code status mapper.
   *
   * @return {HttpCodeStatusMapper} The default HTTP code status mapper.
   */
  static getDefault() {
    return SimpleHttpCodeStatusMapper.INSTANCE;
  }

  /**
   * Returns the HTTP status code for the given status.
   *
   * @param {Status} status The status.
   * @return {number} The HTTP status code.
   * @abstract
   */
  getStatusCode(_status) {
    throw new Error('Method not implemented.');
  }
}

/**
 * A simple {@link HttpCodeStatusMapper} that uses a predefined mapping to
 * determine the HTTP status code.
 *
 * @extends HttpCodeStatusMapper
 */
export class SimpleHttpCodeStatusMapper extends HttpCodeStatusMapper {
  static #DEFAULT_MAPPING = new Map([
    [Status.DOWN, 503],
    [Status.OUT_OF_SERVICE, 503],
  ]);

  static INSTANCE = new SimpleHttpCodeStatusMapper();

  #mappings;

  constructor(mappings = SimpleHttpCodeStatusMapper.#DEFAULT_MAPPING) {
    super();
    this.#mappings = mappings;
  }

  /** @override */
  getStatusCode(/** @type {Status} */ status) {
    return this.#mappings.get(status) ?? 200;
  }
}

/**
 * A logical grouping of health contributors that can be exposed by the
 * {@link HealthEndpoint}.
 *
 * @typedef {object} HealthEndpointGroup
 * @property {StatusAggregator} statusAggregator The status aggregator.
 * @property {HttpCodeStatusMapper} httpCodeStatusMapper The HTTP code status
 *   mapper.
 */

/**
 * A collection of groups for use with a health endpoint.
 *
 * @typedef {object} HealthEndpointGroups
 * @property {HealthEndpointGroup} primary The primary group.
 */

/**
 * Returned by an operation to provide addtional, web-specific information such
 * as the HTTP status code.
 *
 * @typedef {object} EndpointResponse
 * @property {number} status The HTTP status code.
 * @property {Health | CompositeHealth} body The response body.
 */

/**
 * A health endpoint that provides information about the health of the
 * application.
 */
export class HealthEndpoint {
  static ID = 'health';

  static #INSTANCE = new HealthEndpoint(
    HealthContributorRegistry.getDefault(),
    {
      primary: {
        statusAggregator: StatusAggregator.getDefault(),
        httpCodeStatusMapper: HttpCodeStatusMapper.getDefault(),
      },
    },
  );

  /**
   * Returns the default health endpoint.
   *
   * @return {HealthEndpoint} The default health endpoint.
   */
  static getDefault() {
    return HealthEndpoint.#INSTANCE;
  }

  #registry;
  #groups;

  /**
   * Creates a new health endpoint.
   *
   * @param {HealthContributorRegistry} registry The health contributor
   *   registry.
   * @param {HealthEndpointGroups} groups The health groups.
   */
  constructor(/** @type {HealthContributorRegistry} */ registry, groups) {
    assertNotNull(registry, 'Registry must not be null.');
    assertNotNull(groups, 'Groups must not be null.');
    this.#registry = registry;
    this.#groups = groups;
  }

  /**
   * Returns the health of the application.
   *
   * @return {EndpointResponse} The health response.
   */
  health() {
    const result = this.#getHealth();
    const health = result.health;
    const status = result.group.httpCodeStatusMapper.getStatusCode(
      health.status,
    );
    return { status, body: health };
  }

  #getHealth() {
    const statuses = [];
    const components = {};
    for (const { name, contributor } of this.#registry) {
      components[name] = contributor.health();
      statuses.push(components[name].status);
    }

    let health;
    if (statuses.length > 0) {
      const status =
        this.#groups.primary.statusAggregator.getAggregateStatus(statuses);
      health = new CompositeHealth(status, components);
    } else {
      health = Health.up();
    }
    return { health, group: this.#groups.primary };
  }
}
