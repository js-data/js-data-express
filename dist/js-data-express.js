'use strict';

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
    if (orderBy.length) {
      query.orderBy = orderBy.map(function (clause) {
        if (typeof clause === 'string') {
          return JSON.parse(clause);
        }
        return clause;
      });
      query.sort = undefined;
    }
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

function makeHandler(handler) {
  return function (req, res, next) {
    return jsData.utils.resolve().then(function () {
      return handler(req);
    }).then(function (result) {
      res.status(200);
      if (!jsData.utils.isUndefined(result)) {
        res.send(result);
      }
      res.end();
    }).catch(next);
  };
}

function Router(component) {
  if (!(component instanceof jsData.Mapper) && !(component instanceof jsData.Container)) {
    throw new Error('You must provide an instance of JSData.Container, JSData.DataStore, or JSData.Mapper!');
  }

  var router = this.router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: true
  }));

  if (component instanceof jsData.Container) {
    jsData.utils.forOwn(component._mappers, function (mapper, name) {
      router.use('/' + (mapper.endpoint || name), new Router(mapper).router);
    });
  } else if (component instanceof jsData.Mapper) {
    router.route('/')
    // GET /:resource
    .get(makeHandler(function (req) {
      return component.findAll(req.query, req.jsdataOpts);
    }))
    // POST /:resource
    .post(makeHandler(function (req) {
      if (jsData.utils.isArray(req.body)) {
        return component.createMany(req.body, req.jsdataOpts);
      }
      return component.create(req.body, req.jsdataOpts);
    }))
    // PUT /:resource
    .put(makeHandler(function (req) {
      if (jsData.utils.isArray(req.body)) {
        return component.updateMany(req.body, req.jsdataOpts);
      }
      return component.updateAll(req.body, req.query, req.jsdataOpts);
    }))
    // DELETE /:resource
    .delete(makeHandler(function (req) {
      return component.destroyAll(req.query, req.jsdataOpts);
    }));

    router.route('/:id')
    // GET /:resource/:id
    .get(makeHandler(function (req) {
      return component.find(req.params.id, req.jsdataOpts);
    }))
    // PUT /:resource/:id
    .put(makeHandler(function (req) {
      return component.update(req.params.id, req.body, req.jsdataOpts);
    }))
    // DELETE /:resource/:id
    .delete(makeHandler(function (req) {
      return component.destroy(req.params.id, req.jsdataOpts);
    }));
  }
}

jsData.Component.extend({
  constructor: Router
});

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
function mount(app, store, path) {
  if (!(store instanceof jsData.Container)) {
    throw new Error('You must provide an instance of JSData.Container or JSData.DataStore!');
  }
  path || (path = '/');
  app.use(path, queryParser);
  app.use(path, new Router(store).router);
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
var version = {
  alpha: 1,
  full: '1.0.0-alpha.1',
  major: 1,
  minor: 0,
  patch: 0
};

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

exports.Router = Router;
exports.mount = mount;
exports.version = version;
exports.parseQuery = parseQuery;
exports.queryParser = queryParser;
//# sourceMappingURL=js-data-express.js.map