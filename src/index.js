import {
  Component,
  Container
} from 'js-data'

export * from './queryParser'

export function Router (store) {
  if (!(store instanceof Container)) {
    throw new Error('You must provide an instance of JSData.Container or JSData.DataStore!')
  }
  this.router = {}
  this.store = store
}

Component.extend({
  constructor: Router
})

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
