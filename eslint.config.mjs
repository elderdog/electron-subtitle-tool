import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'libs'
  ]
}, {
  rules: {
    'style/arrow-parens': ['error', 'as-needed'],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'style/comma-dangle': ['error', 'never']
  }
}, {
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off'
  }
})
