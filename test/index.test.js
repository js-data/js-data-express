import * as JSDataExpress from '../'
import {Container} from 'js-data'
import {assert} from 'chai'

const {Router, version} = JSDataExpress

describe('js-data-express', function () {
  it('should have correct exports', function () {
    assert.equal(typeof JSDataExpress.Router, 'function')

    assert.throws(() => {
      new Router()
    }, Error, 'You must provide an instance of JSData.Container or JSData.DataStore!')

    const store = new Container()
    const router = new Router(store)
    assert.equal(router instanceof Router, true)
    assert.equal(store instanceof Container, true)
    assert.strictEqual(router.store, store)

    assert.equal(version, '<%= version %>')
  })
})
