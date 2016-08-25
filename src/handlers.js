import { utils } from 'js-data'

const DEFAULTS = {
  create: {
    action (component, req) {
      return component.create(req.body, req.jsdataOpts)
    },
    statusCode: 201
  },
  createMany: {
    action (component, req) {
      return component.createMany(req.body, req.jsdataOpts)
    },
    statusCode: 201
  },
  destroy: {
    action (component, req) {
      return component.destroy(req.params.id, req.jsdataOpts)
    },
    statusCode: 204
  },
  destroyAll: {
    action (component, req) {
      return component.destroyAll(req.query, req.jsdataOpts)
    },
    statusCode: 204
  },
  find: {
    action (component, req) {
      return component.find(req.params.id, req.jsdataOpts)
    },
    statusCode: 200
  },
  findAll: {
    action (component, req) {
      return component.findAll(req.query, req.jsdataOpts)
    },
    statusCode: 200
  },
  update: {
    action (component, req) {
      return component.update(req.params.id, req.body, req.jsdataOpts)
    },
    statusCode: 200
  },
  updateAll: {
    action (component, req) {
      return component.updateAll(req.body, req.query, req.jsdataOpts)
    },
    statusCode: 200
  },
  updateMany: {
    action (component, req) {
      return component.updateMany(req.body, req.jsdataOpts)
    },
    statusCode: 200
  }
}

export function makeRequestHandler (method, component, config = {}) {
  config[method] || (config[method] = {})
  const action = config[method].action || DEFAULTS[method].action

  return (req, res, next) => {
    action(component, req)
      .then((result) => {
        req.jsdataResult = result
        next()
      })
      .catch(next)
  }
}

export function makeResponseHandler (method, component, config = {}) {
  const methodConfig = config[method] || {}
  const statusCode = methodConfig.statusCode || DEFAULTS[method].statusCode
  let toJSON

  // Pick the user's toJSON setting, in order of preference
  if (utils.isFunction(methodConfig.toJSON)) {
    toJSON = (component, result, opts) => methodConfig.toJSON(component, result, opts)
  } else if (methodConfig.toJSON === false) {
    toJSON = (component, result, opts) => result
  } else if (methodConfig.toJSON === true) {
    toJSON = (component, result, opts) => component.toJSON(result, opts)
  } else {
    if (utils.isFunction(config.toJSON)) {
      toJSON = (component, result, opts) => config.toJSON(component, result, opts)
    } else if (config.toJSON === false) {
      toJSON = (component, result, opts) => result
    } else {
      toJSON = (component, result, opts) => component.toJSON(result, opts)
    }
  }

  return (req, res, next) => {
    const result = req.jsdataResult

    res.status(statusCode)

    try {
      if (result !== undefined) {
        res.send(toJSON(component, result, req.jsdataOpts))
      }
    } catch (err) {
      return next(err)
    }

    res.end()
  }
}
