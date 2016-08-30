<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="96" height="96" />

# js-data-express

[![Slack Status][sl_b]][sl_l]
[![npm version][npm_b]][npm_l]
[![Circle CI][circle_b]][circle_l]
[![npm downloads][dn_b]][dn_l]
[![Coverage Status][cov_b]][cov_l]

Generate Express.js-compatible route middleware for [js-data](http://www.js-data.io/) models.

To get started, visit __[http://js-data.io](http://www.js-data.io/docs/js-data-express)__.

### TL;DR

```js
import express from 'express'
import {mount, queryParser, Router} from 'js-data-express'
import {Container} from 'js-data'

const app = express()
const store = new Container()
const UserMapper = store.defineMapper('user')
const CommentMapper = store.defineMapper('comment')
```

Use `mount()`

```js
// Mount store at "/"
mount(app, store)

// Mount store at "/api"
mount(app, store, '/api')
```

Adding as middleware
```js
// Mount queryParser at "/"
app.use(queryParser)
// Mount store at "/"
app.use(new Router(store).router)
```


### js-data-express#Mount

`mount()` will setup routes in the Express instance passed in as the first
argument and expects a js-data store as the second arg, `mount(app, store)`. The endpoints will be reachable for each resource, `Mapper.endpoint` or `Mapper.name` (ie: `GET /user`). You can prefix the endpoints by passing a third arguement, `mount(app, store, '/api')`.

*`queryParser` is added to the endpoints when using `mount()`*

### js-data-express#Router

`new Router(store).router` will be an Express router instance that can be dropped
in with `app.use('/api', new Router(store).router)`.

### Create Express Route Instance
Be sure to add `queryParser` as middleware in this case. This will correctly parse  js-data calls to your Express app for use with the store.
```js
var api = app.route('/api')
// Mount queryParser at "/api"
api.use(queryParser)
// Mount UserMapper at "/api/user"
api.use('/user', new Router(UserMapper).router)
// Mount UserMapper at "/api/comment"
api.use('/comment', new Router(CommentMapper).router)
```

### Custom Route Middleware

You can add middleware to a all/or specific resource endpoint.

```js
const config = {
  path: '/api',
  // the middleware method for all requests
  request: (req, res, next) => {
    console.log(req.method + '::' + req.path)
    next()
  },

  // middleware on a specific action
  destroy: {
    request: (req, res, next) => {
      if (req.session.isAdmin) {
        next()
      } else {
        // deny request for destroy
        next(new Error('User is not admin'))
      }
    }
  }
}

mount(app, store, config)
```

### Custom Request/Response Handlers
If you need custom logic in your request, you can declare your handler per method (http verb action, ie: 'create', 'updateAll', etc.) in the config.

*Note: js-data-express attaches the results from the store query to `req.jsdataResult`*

You can override the response results with a custom `toJSON` method in the config, per method the same as the request handlers or declare `toJSON` method for all action response handlers with `toJSON` at the top level of the config object.

```js
// add custom request/response for a single endpoint resource
const UserConfig = {
  path: '/api',

  // all actions response handler method
  toJSON: (component, results, jsdataOpts) => {
    // delete password on response for all actions
    if (Array.isArray(results)) {
      results = results.map((r) => {
        delete r.password
        return r
      })
    }
    else if (results && results.id) {
      delete results.password
    }

    return results
  },

  create: {
    // request handler - must return a Promise
    action: (component, req) {
      return new Promise((resolve, reject) => {
        // logic...
        resolve(results)
      })
    },
    toJSON: (component, results, jsdataOpts) => {
      // do something to response result only on 'create' action
      return results
    }
  },

  destroy: {
    action: (component, req) {
      if (req.session && req.session.isAdmin) {
        return component.destroy(req.params.id, req.jsdataOpts)
      }
      else {
        return Promise.reject()
      }
    }
  },

  destroyAll: {
    action: (component, req) {
      if (req.session && req.session.isAdmin) {
        return component.destroyAll(req.query, req.jsdataOpts)
      }
      else {
        return Promise.reject()
      }
    }
  }
}

mount(app, UserMapper, UserConfig)
```

## Links

* [Quick start](http://www.js-data.io/docs/home#quick-start) - Get started in 5 minutes
* [Guides and Tutorials](http://www.js-data.io/docs/home) - Learn how to use JSData
* [`js-data-express` Guide](http://www.js-data.io/docs/js-data-express) - Learn how to use `js-data-express`
* [API Reference Docs](http://api.js-data.io) - Explore components, methods, options, etc.
* [Community & Support](http://js-data.io/docs/community) - Find solutions and chat with the community
* [General Contributing Guide](http://js-data.io/docs/contributing) - Give back and move the project forward
  * [Contributing to js-data-express](https://github.com/js-data/js-data-express/blob/master/.github/CONTRIBUTING.md)

## License

The MIT License (MIT)

Copyright (c) 2014-2016 js-data-express project authors

* [LICENSE](https://github.com/js-data/js-data-express/blob/master/LICENSE)
* [AUTHORS](https://github.com/js-data/js-data-express/blob/master/AUTHORS)
* [CONTRIBUTORS](https://github.com/js-data/js-data-express/blob/master/CONTRIBUTORS)

[sl_b]: http://slack.js-data.io/badge.svg
[sl_l]: http://slack.js-data.io
[npm_b]: https://img.shields.io/npm/v/js-data-express.svg?style=flat
[npm_l]: https://www.npmjs.org/package/js-data-express
[circle_b]: https://img.shields.io/circleci/project/js-data/js-data-express.svg?style=flat
[circle_l]: https://circleci.com/gh/js-data/js-data-express
[dn_b]: https://img.shields.io/npm/dm/js-data-express.svg?style=flat
[dn_l]: https://www.npmjs.org/package/js-data-express
[cov_b]: https://img.shields.io/codecov/c/github/js-data/js-data-express.svg?style=flat
[cov_l]: https://codecov.io/github/js-data/js-data-express
