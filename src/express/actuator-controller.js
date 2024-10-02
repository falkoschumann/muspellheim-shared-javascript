/**
 * @import { HealthRegistry } from '../health.js'
 * @import * as express from 'express'
 */

import * as handler from './handler.js';

export class ActuatorController {
  #services;
  #healthRegistry;

  constructor(
    services, // FIXME Services is not defined in library
    /** @type {HealthRegistry} */ healthRegistry,
    /** @type {express.Express} */ app,
  ) {
    this.#services = services;
    this.#healthRegistry = healthRegistry;

    app.get('/actuator', this.#getActuator.bind(this));
    app.get('/actuator/info', this.#getActuatorInfo.bind(this));
    app.get('/actuator/metrics', this.#getActuatorMetrics.bind(this));
    app.get('/actuator/health', this.#getActuatorHealth.bind(this));
    app.get(
      '/actuator/prometheus',
      handler.runSafe(this.#getMetrics.bind(this)),
    );
  }

  async #getActuator(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    let requestedUrl =
      request.protocol + '://' + request.get('host') + request.originalUrl;
    if (!requestedUrl.endsWith('/')) {
      requestedUrl += '/';
    }
    response.status(200).json({
      _links: {
        self: { href: requestedUrl },
        info: { href: requestedUrl + 'info' },
        metrics: { href: requestedUrl + 'metrics' },
        health: { href: requestedUrl + 'health' },
        prometheus: { href: requestedUrl + 'prometheus' },
      },
    });
  }

  async #getActuatorInfo(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const info = {};
    info[process.env.npm_package_name] = {
      version: process.env.npm_package_version,
    };
    response.status(200).json(info);
  }

  async #getActuatorMetrics(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    response.status(200).json({
      cpu: process.cpuUsage(),
      mem: process.memoryUsage(),
      uptime: process.uptime(),
    });
  }

  #getActuatorHealth(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const health = this.#healthRegistry.health();
    const status = health.status === 'UP' ? 200 : 503;
    response.status(status).json(health);
  }

  async #getMetrics(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    // TODO count warnings and errors
    // TODO create class MeterRegistry

    const metrics = await this.#services.getMetrics();
    const timestamp = new Date().getTime();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount} ${timestamp}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount} ${timestamp}\n\n`;
    body += `# TYPE comments_count gauge\ncomments_count ${metrics.commentsCount} ${timestamp}\n\n`;
    handler.reply(response, { body });
  }
}
