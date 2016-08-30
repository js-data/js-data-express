import {
  assert,
  JSData,
  makeRequestHandler,
  makeResponseHandler
} from './_setup'
const httpMocks = require('node-mocks-http')

describe('js-data-express handlers', function () {
  it('should have correct exports', function () {
    assert.equal(typeof makeRequestHandler, 'function')
    assert.equal(typeof makeResponseHandler, 'function')
  })

  it('makeRequestHandler & makeResponseHandler should return a function', function () {
    assert.equal(typeof makeRequestHandler('find'), 'function')
    assert.equal(typeof makeResponseHandler('find'), 'function')
  })

  it('makeResponseHandler toJSON handlers should execute correctly', function () {
    const store = new JSData.Container()
    const userMapper = store.defineMapper('user')

    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()

    req.jsdataResult = []

    makeResponseHandler('find', userMapper, {
      find: {
        toJSON: () => {}
      }
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      find: {
        toJSON: false
      }
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      find: {
        toJSON: true
      }
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      toJSON: () => {}
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      toJSON: false
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      toJSON: true
    })(req, res, () => {})

    makeResponseHandler('find', userMapper, {
      toJSON: () => { throw new Error() }
    })(req, res, () => {})
  })
})
