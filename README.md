<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="96" height="96" />

# js-data-express

[![Slack Status][sl_b]][sl_l]
[![npm version][npm_b]][npm_l]
[![Circle CI][circle_b]][circle_l]
[![npm downloads][dn_b]][dn_l]
[![Coverage Status][cov_b]][cov_l]

Generate Express.js-compatible route middleware for [js-data](http://www.js-data.io/) models.

To get started, visit __[http://js-data.io](http://www.js-data.io/docs/js-data-express)__.

```js
import express from 'express';
import { mount, queryParser, Router } from 'js-data-express';
import { Container } from 'js-data';

const app = express();
const store = new Container();
const UserMapper = store.defineMapper('user');
const CommentMapper = store.defineMapper('comment');
```

```js
// Mount queryParser and store at "/"
mount(app, store);

// Mount queryParser and store at "/api"
mount(app, store, '/api');

// Mount queryParser at "/"
app.use(queryParser);
// Mount store at "/"
app.use(new Router(store).router);

// Mount queryParser at "/api"
app.use('/api' queryParser);
// Mount store at "/api"
app.use('/api', new Router(store).router);

// Create an express Router instance
const api = express().Router();
// Mount queryParser
api.use(queryParser);
// Mount UserMapper at "/api/user"
api.use('/user', new Router(UserMapper).router);
// Mount UserMapper at "/api/comment"
api.use('/comment', new Router(CommentMapper).router);
// Use api Router in an existing express app instance
app.use('/api', api);
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

Copyright (c) 2016-2017 js-data-express project authors

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
