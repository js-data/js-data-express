import {
  assert,
  JSDataExpress
} from './_setup'

import sinon from 'sinon'

describe('queryParser', function () {
  it('should use parseQuery', function (done) {
    const req = {
      query: {
        with: ['baz'],
        where: '{"foo":"bar"}'
      }
    }
    const res = {}
    JSDataExpress.queryParser(req, res, function () {
      assert.deepEqual(req, {
        jsdataOpts: {
          with: ['baz']
        },
        query: {
          where: {
            foo: 'bar'
          }
        }
      })
      done()
    })
  })
})

describe('queryParser', function () {
  it('should parse query.where as JSON', function () {
    const query = {
      where: '{"foo":"bar"}'
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      where: {
        foo: 'bar'
      }
    })
  })

  it('should fail gracefully if query.where is unable to parsed as JSON', function () {
    it('calls next with the error received if orderBy fails to parse as JSON', function () {
      const query = {
        where: '{"foo":"bar"}e'
      }
      const next = sinon.spy()
      JSDataExpress.queryParser({ query }, {}, next)
      assert.equal(next.calledOnce, true)
      assert.equal(next.firstCall.args.length, 0)
    })
  })

  it('should parse orderBy as JSON if orderBy is present and not empty', function () {
    const query = {
      orderBy: ['{"foo":"bar"}']
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: [{
        foo: 'bar'
      }],
      sort: undefined
    })
  })

  it('calls next with the error received if orderBy fails to parse as JSON', function () {
    const query = {
      orderBy: ['{"foo":"bar"}e']
    }
    const next = sinon.spy()
    JSDataExpress.queryParser({ query }, {}, next)
    assert.equal(next.calledOnce, true)
    assert.equal(next.firstCall.args.length, 1)
  })

  it('should use orderBy directly if orderBy is present is not a string', function () {
    const query = {
      orderBy: [{foo: 'bar'}]
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: [{
        foo: 'bar'
      }],
      sort: undefined
    })
  })

  it('should use orderBy directly if orderBy is present as simple string', function () {
    const query = {
      orderBy: 'foo'
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: 'foo',
      sort: undefined
    })
  })

  it('should use orderBy directly if orderBy is present as array of strings', function () {
    const query = {
      orderBy: ['foo']
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: ['foo'],
      sort: undefined
    })
  })

  it('should not parse orderBy if orderby is present but is empty', function () {
    const query = {
      orderBy: []
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, query)
  })

  it('should parse sort as JSON if sort is present and is not empty', function () {
    const query = {
      sort: ['{"foo":"bar"}']
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: [{
        foo: 'bar'
      }],
      sort: undefined
    })
  })

  it('should use sort directly if sort is present is not a string', function () {
    const query = {
      sort: [{foo: 'bar'}]
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: [{
        foo: 'bar'
      }],
      sort: undefined
    })
  })

  it('should not parse sort if sort is present but is empty', function () {
    const query = {
      orderBy: []
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, query)
  })

  it('should parse sort if sort is an array', function () {
    const query = {
      orderBy: '["score","ASC"]'
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      orderBy: ['score', 'ASC'],
      sort: undefined
    })
  })

  it('should throw error on sort param that is not a valid array', function () {
    const query = {
      orderBy: '["score","ASC"'
    }
    assert.throws(function () {
      JSDataExpress.parseQuery(query)
    }, Error)
  })

  it('calls next with the error received if sort fails to parse as JSON', function () {
    const query = {
      sort: ['{"foo":"bar"}e']
    }
    const next = sinon.spy()
    JSDataExpress.queryParser({ query }, {}, next)
    assert.equal(next.calledOnce, true)
    assert.equal(next.firstCall.args.length, 1)
  })

  it('should parse limit')
  it('should parse skip')
  it('should parse offset')
  it('should parse with')
})
