module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "babel-eslint",
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': ['error', 'never'],
    'no-undef': 'off',
    'brace-style': 'off',
    'no-unused-vars': 'off',
    semi: 'off'
  },
  overrides: [
    {
      files: [
        '**/**/**/*.spec.{j,t}s?(x)',
        '**/**/**/*.test.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}