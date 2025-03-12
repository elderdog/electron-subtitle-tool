// uno.config.ts
import { defineConfig, transformerDirectives } from 'unocss'

export default defineConfig({
  // ...
  content: {
    filesystem: [
      'src/**/*.{html,vue,js,ts,jsx,tsx,scss,css}',
      'renderer/**/*.{html,vue,js,ts,jsx,tsx,scss,css}'
    ]
  },
  transformers: [
    transformerDirectives()
  ],
  shortcuts: {
    'mt-title-bar': 'mt-30px',
    'pt-title-bar': 'pt-30px'
  },
  rules: [
    ['drag', { '-webkit-app-region': 'drag' }],
    ['no-drag', { '-webkit-app-region': 'no-drag' }]
  ]
})
