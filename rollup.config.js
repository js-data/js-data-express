import babel from 'rollup-plugin-babel'

export default {
  external: [
    'express',
    'js-data',
    'body-parser'
  ],
  plugins: [
    babel({
      babelrc: false,
      plugins: [
        'external-helpers'
      ],
      presets: [
        [
          'es2015',
          {
            modules: false
          }
        ]
      ],
      exclude: 'node_modules/**'
    })
  ]
}
