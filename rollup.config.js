var babel = require('rollup-plugin-babel')

module.exports = {
  external: [
    'js-data'
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        'es2015-rollup'
      ],
      exclude: 'node_modules/**'
    })
  ]
}
