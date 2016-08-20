import {
  Component,
  Container,
  Mapper,
  utils
} from 'js-data'

import {queryParser} from './queryParser'
export * from './queryParser'
import express from 'express'
import bodyParser from 'body-parser'

function makeHandler (handler, resHandler) {
  return function (req, res, next) {
    return utils.resolve()
      .then(function () {
        return handler(req)
      })
      .then(function (result) {
        res.status(200)
        if (resHandler) {
          return resHandler(result,req,res,next)
        }
        if (!utils.isUndefined(result)) {
          res.send(result)
        }
        res.end()
      })
      .catch(next)
  }
}

export function Router (component) {
  if (!(component instanceof Mapper) && !(component instanceof Container)) {
    throw new Error('You must provide an instance of JSData.Container, JSData.DataStore, or JSData.Mapper!')
  }

  const router = this.router = express.Router()
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({
    extended: true
  }))

  if (component instanceof Container) {
    utils.forOwn(component._mappers, (mapper, name) => {
      router.use(`/${mapper.endpoint || name}`, new Router(mapper).router)
    })
  } else if (component instanceof Mapper) {
    const resHandlers = curateResHandlers(component.resHandler || component.resHandlers);

    router.route('/')
      // GET /:resource
      .get(makeHandler(function (req) {
        return component.findAll(req.query, req.jsdataOpts)
      },resHandlers.get))
      // POST /:resource
      .post(makeHandler(function (req) {
        if (utils.isArray(req.body)) {
          return component.createMany(req.body, req.jsdataOpts)
        }
        return component.create(req.body, req.jsdataOpts)
      },resHandlers.post))
      // PUT /:resource
      .put(makeHandler(function (req) {
        if (utils.isArray(req.body)) {
          return component.updateMany(req.body, req.jsdataOpts)
        }
        return component.updateAll(req.body, req.query, req.jsdataOpts)
      },resHandlers.put))
      // DELETE /:resource
      .delete(makeHandler(function (req) {
        return component.destroyAll(req.query, req.jsdataOpts)
      },resHandlers.delete))

    router.route('/:id')
      // GET /:resource/:id
      .get(makeHandler(function (req) {
        return component.find(req.params.id, req.jsdataOpts)
      },resHandlers.get))
      // PUT /:resource/:id
      .put(makeHandler(function (req) {
        return component.update(req.params.id, req.body, req.jsdataOpts)
      },resHandlers.put))
      // DELETE /:resource/:id
      .delete(makeHandler(function (req) {
        return component.destroy(req.params.id, req.jsdataOpts)
      },resHandlers.delete))
  }
}

function curateResHandlers(handlers) {
  if (!handlers || typeof handlers !== "function" && typeof handlers !== "object") {
    return null
  }
  if (typeof handlers === "function") {
    return {
      get: handlers,
      post: handlers,
      put: handlers,
      delete: handlers
    }
  }
  return handlers
}

Component.extend({
  constructor: Router
})

/**
 * Convenience method that mounts {@link queryParser} and a store.
 *
 * @example <caption>Mount queryParser and store at "/"</caption>
 * import express from 'express'
 * import {mount, queryParser, Router} from 'js-data-express'
 * import {Container} from 'js-data'
 *
 * const app = express()
 * const store = new Container()
 * const UserMapper = store.defineMapper('user')
 * const CommentMapper = store.defineMapper('comment')
 * mount(app, store)
 *
 * @example <caption>Mount queryParser and store at "/api"</caption>
 * mount(app, store, '/api')
 *
 * @name module:js-data-express.mount
 * @type {Function}
 * @param {*} app
 * @param {*} store
 * @param {string} [path]
 */
export function mount (app, store, path) {
  if (!(store instanceof Container)) {
    throw new Error('You must provide an instance of JSData.Container or JSData.DataStore!')
  }
  path || (path = '/')
  app.use(path, queryParser)
  app.use(path, new Router(store).router)
}

/**
 * Details of the current version of the `js-data-express` module.
 *
 * @example <caption>ES2015 modules import</caption>
 * import {version} from 'js-data-express'
 * console.log(version.full)
 *
 * @example <caption>CommonJS import</caption>
 * var version = require('js-data-express').version
 * console.log(version.full)
 *
 * @name module:js-data-express.version
 * @type {Object}
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
 * import {Router} from 'js-data-express'
 * const adapter = new Router()
 *
 * @example <caption>CommonJS import</caption>
 * var Router = require('js-data-express').Router
 * var adapter = new Router()
 *
 * @name module:js-data-express.Router
 * @see Router
 * @type {Constructor}
 */

/**
 * Registered as `js-data-express` in NPM.
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data-express@beta js-data@beta
 *
 * @example <caption>ES2015 modules import</caption>
 * import {Router} from 'js-data-express'
 * const adapter = new Router()
 *
 * @example <caption>CommonJS import</caption>
 * var Router = require('js-data-express').Router
 * var adapter = new Router()
 *
 * @module js-data-express
 */
