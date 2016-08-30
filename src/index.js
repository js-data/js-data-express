import {
  Component,
  Container,
  Mapper,
  utils
} from 'js-data'

import { queryParser } from './queryParser'
export * from './queryParser'
import * as handlers from './handlers'
import express from 'express'
import bodyParser from 'body-parser'

const handlerNoop = (req, res, next) => {
  next()
}

function makeHandler (method, component, config = {}) {
  config[method] || (config[method] = {})
  const userRequestHandler = utils.isFunction(config[method].request) ? config[method].request : handlerNoop
  const defaultRequestHandler = handlers.makeRequestHandler(method, component, config)
  const defaultResponseHandler = handlers.makeResponseHandler(method, component, config)

  return (req, res, next) => {
    userRequestHandler(req, res, (err) => {
      if (err) {
        return next(err)
      }
      defaultRequestHandler(req, res, (err) => {
        if (err) {
          return next(err)
        }
        if (utils.isFunction(config[method].response)) {
          config[method].response(req, res, next)
        } else {
          defaultResponseHandler(req, res, next)
        }
      })
    })
  }
}

/**
 * TODO
 *
 * @typedef RequestHandler
 * @type function
 * @param {object} req TODO
 * @param {object} res TODO
 * @param {function} next TODO
 */

/**
 * TODO
 *
 * @typedef ResponseHandler
 * @type function
 * @param {object} req TODO
 * @param {object} res TODO
 * @param {function} next TODO
 */

/**
 * @typedef ActionHandler
 * @type function
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {object} req TODO
 * @returns {Promise} Promise that resolves with the result.
 */

/**
 * @typedef Serializer
 * @type function
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {object} result The result of the endpoint's {@link ActionHandler}.
 * @param {object} opts Configuration options.
 * @returns {*} The serialized result.
 */

/**
 * TODO
 *
 * @typedef CreateConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef CreateManyConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef DestroyConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef DestroyAllConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef FindConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef FindAllConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef UpdateConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef UpdateAllConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef UpdateManyConfig
 * @type object
 * @property {ActionHandler} action TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {number} statusCode TODO
 * @property {Serializer|boolean} toJSON TODO
 */

/**
 * TODO
 *
 * @typedef Config
 * @type object
 * @property {CreateConfig} [create] TODO
 * @property {CreateManyConfig} [createMany] TODO
 * @property {DestroyConfig} [destroy] TODO
 * @property {DestroyAllConfig} [destroyAll] TODO
 * @property {FindConfig} [find] TODO
 * @property {FindAllConfig} [findAll] TODO
 * @property {RequestHandler} request TODO
 * @property {ResponseHandler} response TODO
 * @property {Serializer|boolean} [toJSON] TODO
 * @property {UpdateConfig} [update] TODO
 * @property {UpdateAllConfig} [updateAll] TODO
 * @property {UpdateManyConfig} [updateMany] TODO
 */

/**
 * @class Router
 *
 * @param {object} component Instance of `Mapper`, `Container`, `SimpleStore`,
 * or `DataStore`.
 * @param {Config} [config] Optional configuration.
 *
 */
export function Router (component, config = {}) {
  if (!(component instanceof Mapper) && !(component instanceof Container)) {
    throw new Error('You must provide an instance of JSData.Container, JSData.DataStore, or JSData.Mapper!')
  }

  const router = this.router = express.Router()
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({
    extended: true
  }))

  if (utils.isFunction(config.request)) {
    router.use(config.request)
    config.request = undefined
  }

  if (component instanceof Container) {
    utils.forOwn(component._mappers, (mapper, name) => {
      let endpoint = `/${mapper.endpoint || name}`
      if (utils.isFunction(config.getEndpoint)) {
        endpoint = config.getEndpoint(mapper)
      }
      router.use(endpoint, new Router(mapper, config).router)
    })
  } else if (component instanceof Mapper) {
    const createManyHandler = makeHandler('createMany', component, config)
    const createHandler = makeHandler('create', component, config)
    const updateManyHandler = makeHandler('updateMany', component, config)
    const updateAllHandler = makeHandler('updateAll', component, config)

    router.route('/')
      // GET /:resource
      .get(makeHandler('findAll', component, config))
      // POST /:resource
      .post(function (req, res, next) {
        if (utils.isArray(req.body)) {
          createManyHandler(req, res, next)
        } else {
          createHandler(req, res, next)
        }
      })
      // PUT /:resource
      .put(function (req, res, next) {
        if (utils.isArray(req.body)) {
          updateManyHandler(req, res, next)
        } else {
          updateAllHandler(req, res, next)
        }
      })
      // DELETE /:resource
      .delete(makeHandler('destroyAll', component, config))

    router.route('/:id')
      // GET /:resource/:id
      .get(makeHandler('find', component, config))
      // PUT /:resource/:id
      .put(makeHandler('update', component, config))
      // DELETE /:resource/:id
      .delete(makeHandler('destroy', component, config))
  }
}

Component.extend({
  constructor: Router
})

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
export function mount (app, store, config = {}) {
  if (!(store instanceof Container)) {
    throw new Error('You must provide an instance of JSData.Container or JSData.DataStore!')
  }
  if (utils.isString(config)) {
    config = { path: config }
  }
  config.path || (config.path = '/')

  app.use(config.path, queryParser)
  app.use(config.path, new Router(store, config).router)
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
export const version = '<%= version %>'

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
