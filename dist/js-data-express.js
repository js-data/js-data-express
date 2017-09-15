'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var jsData = require('js-data');
var express = _interopDefault(require('express'));
var bodyParser = _interopDefault(require('body-parser'));

function parseQuery(query) {
  if (query.where) {
    try {
      query.where = JSON.parse(query.where);
    } catch (err) {}
  }
  if (query.orderBy || query.sort) {
    var orderBy = query.orderBy || query.sort;
    if (orderBy && typeof orderBy === 'string' && orderBy[0] === '[') {
      try {
        orderBy = JSON.parse(orderBy);
      } catch (err) {
        console.error('orderBy querystring parameter is not a well-formatted array!');
        throw err;
      }
    }
    if (Array.isArray(orderBy)) {
      query.orderBy = orderBy.map(function (clause) {
        if (typeof clause === 'string' && clause.indexOf('{') >= 0) {
          return JSON.parse(clause);
        }
        return clause;
      });
    }
    query.sort = undefined;
  }
}

function queryParser(req, res, next) {
  req.jsdataOpts || (req.jsdataOpts = {});
  if (req.query.with) {
    req.jsdataOpts.with = req.query.with;
    delete req.query.with;
  }
  try {
    parseQuery(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

var DEFAULTS = {
  create: {
    action: function action(component, req) {
      return component.create(req.body, req.jsdataOpts);
    },

    statusCode: 201
  },
  createMany: {
    action: function action(component, req) {
      return component.createMany(req.body, req.jsdataOpts);
    },

    statusCode: 201
  },
  destroy: {
    action: function action(component, req) {
      return component.destroy(req.params.id, req.jsdataOpts);
    },

    statusCode: 204
  },
  destroyAll: {
    action: function action(component, req) {
      return component.destroyAll(req.query, req.jsdataOpts);
    },

    statusCode: 204
  },
  find: {
    action: function action(component, req) {
      return component.find(req.params.id, req.jsdataOpts);
    },

    statusCode: 200
  },
  findAll: {
    action: function action(component, req) {
      return component.findAll(req.query, req.jsdataOpts);
    },

    statusCode: 200
  },
  update: {
    action: function action(component, req) {
      return component.update(req.params.id, req.body, req.jsdataOpts);
    },

    statusCode: 200
  },
  updateAll: {
    action: function action(component, req) {
      return component.updateAll(req.body, req.query, req.jsdataOpts);
    },

    statusCode: 200
  },
  updateMany: {
    action: function action(component, req) {
      return component.updateMany(req.body, req.jsdataOpts);
    },

    statusCode: 200
  }
};

function makeRequestHandler(method, component) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  config[method] || (config[method] = {});
  var action = config[method].action || DEFAULTS[method].action;

  return function (req, res, next) {
    action(component, req).then(function (result) {
      req.jsdataResult = result;
      next();
    }).catch(next);
  };
}

function makeResponseHandler(method, component) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var methodConfig = config[method] || {};
  var statusCode = methodConfig.statusCode || DEFAULTS[method].statusCode;
  var toJSON = void 0;

  // Pick the user's toJSON setting, in order of preference
  if (jsData.utils.isFunction(methodConfig.toJSON)) {
    toJSON = function toJSON(component, result, opts) {
      return methodConfig.toJSON(component, result, opts);
    };
  } else if (methodConfig.toJSON === false) {
    toJSON = function toJSON(component, result, opts) {
      return result;
    };
  } else if (methodConfig.toJSON === true) {
    toJSON = function toJSON(component, result, opts) {
      return component.toJSON(result, opts);
    };
  } else {
    if (jsData.utils.isFunction(config.toJSON)) {
      toJSON = function toJSON(component, result, opts) {
        return config.toJSON(component, result, opts);
      };
    } else if (config.toJSON === false) {
      toJSON = function toJSON(component, result, opts) {
        return result;
      };
    } else {
      toJSON = function toJSON(component, result, opts) {
        return component.toJSON(result, opts);
      };
    }
  }

  return function (req, res, next) {
    var result = req.jsdataResult;

    res.status(statusCode);

    try {
      if (result !== undefined) {
        res.send(toJSON(component, result, req.jsdataOpts));
      }
    } catch (err) {
      return next(err);
    }

    res.end();
  };
}

var handlerNoop = function handlerNoop(req, res, next) {
  next();
};

function makeHandler(method, component) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  config[method] || (config[method] = {});
  var userRequestHandler = jsData.utils.isFunction(config[method].request) ? config[method].request : handlerNoop;
  var defaultRequestHandler = makeRequestHandler(method, component, config);
  var defaultResponseHandler = makeResponseHandler(method, component, config);

  return function (req, res, next) {
    userRequestHandler(req, res, function (err) {
      if (err) {
        return next(err);
      }
      defaultRequestHandler(req, res, function (err) {
        if (err) {
          return next(err);
        }
        if (jsData.utils.isFunction(config[method].response)) {
          config[method].response(req, res, next);
        } else {
          defaultResponseHandler(req, res, next);
        }
      });
    });
  };
}

/**
 * A middleware method invoked on all requests
 *
 * @typedef RequestHandler
 * @type function
 * @param {object} req HTTP(S) Request Object
 * @param {object} res HTTP(S) Response Object
 * @param {function} next Express `next()` callback to continue the chain
 */

/**
 * A method that handles all responses
 *
 * @typedef ResponseHandler
 * @type function
 * @param {object} req HTTP(S) Request Object
 * @param {object} res HTTP(S) Response Object
 * @param {function} next Express `next()` callback to continue the chain
 */

/**
 * Custom defined method that retrieves data/results for an endpoint
 *
 * @typedef ActionHandler
 * @type function
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {object} req HTTP(S) Request Object
 *
 * @example <caption>A custom action</caption>
 * (component, req) => {
 *    return new Promise((resolve, reject) => {
 *      // ..some logic
 *      return resolve(results)
 *     })
 * }
 *
 * @returns {Promise} Promise that resolves with the result.
 */

/**
 * @typedef Serializer
 * @type function
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {object} result The result of the endpoint's {@link ActionHandler}.
 * @param {object} opts Configuration options.
 * @returns {object|array|undefined} The serialized result.
 */

/**
 * create action configs
 *
 * @typedef CreateConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * createMany action configs
 *
 * @typedef CreateManyConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * destroy action configs
 *
 * @typedef DestroyConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * destroyAll action configs
 *
 * @typedef DestroyAllConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * find action configs
 *
 * @typedef FindConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * findAll action configs
 *
 * @typedef FindAllConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * update action configs
 *
 * @typedef UpdateConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * UpdateAllConfig action configs
 *
 * @typedef UpdateAllConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * updateMany action configs
 *
 * @typedef UpdateManyConfig
 * @type object
 * @property {ActionHandler} [action] Custom action to retrieve data results
 * @property {number} [statusCode] The status code to return with the response
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 */

/**
 * Define endpoint path with custom logic
 *
 * @typedef Endpoint
 * @type function
 * @param {Object} mapper Component Mapper object
 */

/**
 * Configuration options for endpoints, actions, & request/response
 *
 * @typedef Config
 * @type object
 * @property {Endpoint} [getEndpoint] Define endpoints with custom method
 * @property {CreateConfig} [create] create action configs
 * @property {CreateManyConfig} [createMany] createMany action configs
 * @property {DestroyConfig} [destroy] destroy action configs
 * @property {DestroyAllConfig} [destroyAll] destroyAll action configs
 * @property {FindConfig} [find] find action configs
 * @property {FindAllConfig} [findAll] findAll action configs
 * @property {Serializer|boolean} [toJSON] Define custom toJSON method for response results
 * @property {UpdateConfig} [update] update action configs
 * @property {UpdateAllConfig} [updateAll] updateAll action configs
 * @property {UpdateManyConfig} [updateMany] updateMany action configs
 */

/**
 * @class Router
 *
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {Config} [config] Optional configuration.
 *
 */
function Router(component) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!(component instanceof jsData.Mapper) && !(component instanceof jsData.Container)) {
    throw new Error('You must provide an instance of JSData.Container, JSData.DataStore, or JSData.Mapper!');
  }

  var router = this.router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: true
  }));

  if (jsData.utils.isFunction(config.request)) {
    router.use(config.request);
    config.request = undefined;
  }

  if (component instanceof jsData.Container) {
    jsData.utils.forOwn(component._mappers, function (mapper, name) {
      var endpoint = '/' + (mapper.endpoint || name);
      if (jsData.utils.isFunction(config.getEndpoint)) {
        endpoint = config.getEndpoint(mapper);
      }
      router.use(endpoint, new Router(mapper, config).router);
    });
  } else if (component instanceof jsData.Mapper) {
    var createManyHandler = makeHandler('createMany', component, config);
    var createHandler = makeHandler('create', component, config);
    var updateManyHandler = makeHandler('updateMany', component, config);
    var updateAllHandler = makeHandler('updateAll', component, config);

    router.route('/')
    // GET /:resource
    .get(makeHandler('findAll', component, config))
    // POST /:resource
    .post(function (req, res, next) {
      if (jsData.utils.isArray(req.body)) {
        createManyHandler(req, res, next);
      } else {
        createHandler(req, res, next);
      }
    })
    // PUT /:resource
    .put(function (req, res, next) {
      if (jsData.utils.isArray(req.body)) {
        updateManyHandler(req, res, next);
      } else {
        updateAllHandler(req, res, next);
      }
    })
    // DELETE /:resource
    .delete(makeHandler('destroyAll', component, config));

    router.route('/:id')
    // GET /:resource/:id
    .get(makeHandler('find', component, config))
    // PUT /:resource/:id
    .put(makeHandler('update', component, config))
    // DELETE /:resource/:id
    .delete(makeHandler('destroy', component, config));
  }
}

jsData.Component.extend({
  constructor: Router
});

/**
 * Convenience method that mounts {@link queryParser} and a store.
 *
 * @example <caption>Mount queryParser and store at "/"</caption>
 * import express from 'express';
 * import { mount, queryParser, Router } from 'js-data-express';
 * import { Container } from 'js-data';
 *
 * const app = express();
 * const store = new Container();
 * const UserMapper = store.defineMapper('user');
 * const CommentMapper = store.defineMapper('comment');
 * mount(app, store);
 *
 * @example <caption>Mount queryParser and store at "/api"</caption>
 * mount(app, store, '/api');
 *
 * @name module:js-data-express.mount
 * @method
 * @param {*} app
 * @param {object} store Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {Config|string} [config] Configuration options.
 */
function mount(app, store) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!(store instanceof jsData.Container)) {
    throw new Error('You must provide an instance of JSData.Container or JSData.DataStore!');
  }
  if (jsData.utils.isString(config)) {
    config = { path: config };
  }
  config.path || (config.path = '/');

  app.use(config.path, queryParser);
  app.use(config.path, new Router(store, config).router);
}

/**
 * Details of the current version of the `js-data-express` module.
 *
 * @example <caption>ES2015 modules import</caption>
 * import { version } from 'js-data-express';
 * console.log(version.full);
 *
 * @example <caption>CommonJS import</caption>
 * var version = require('js-data-express').version;
 * console.log(version.full);
 *
 * @name module:js-data-express.version
 * @type {object}
 * @property {string} version.full The full semver value.
 * @property {number} version.major The major version number.
 * @property {number} version.minor The minor version number.
 * @property {number} version.patch The patch version number.
 * @property {(string|boolean)} version.alpha The alpha version value,
 * otherwise `false` if the current version is not alpha.
 * @property {(string|boolean)} version.beta The beta version value,
 * otherwise `false` if the current version is not beta.
 */
var version = {
  full: '1.0.1',
  major: 1,
  minor: 0,
  patch: 1
};

/**
 * {@link Router} class.
 *
 * @example <caption>ES2015 modules import</caption>
 * import { Router } from 'js-data-express';
 * const adapter = new Router();
 *
 * @example <caption>CommonJS import</caption>
 * var Router = require('js-data-express').Router;
 * var adapter = new Router();
 *
 * @name module:js-data-express.Router
 * @see Router
 * @type {Constructor}
 */

/**
 * Registered as `js-data-express` in NPM.
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data-express@rc js-data@rc
 *
 * @example <caption>ES2015 modules import</caption>
 * import { Router } from 'js-data-express';
 * const adapter = new Router();
 *
 * @example <caption>CommonJS import</caption>
 * var Router = require('js-data-express').Router;
 * var adapter = new Router();
 *
 * @module js-data-express
 */

exports.Router = Router;
exports.mount = mount;
exports.version = version;
exports.parseQuery = parseQuery;
exports.queryParser = queryParser;
//# sourceMappingURL=js-data-express.js.map
