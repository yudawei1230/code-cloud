'use strict'

module.exports = {
  scripts: {
    'build': [
      'rm -rf dist',
      'npm run build',
      'dlz exec zip',
      'npx http-server ./dist -p 7832'
    ]
  },
  options: {
    zip: {
      include: [
        '**/cloud-cli/**',
        '**/file-base/**',
        '!**/node_modules/**',
        '!**/storage/**',
        'dlz.config.js',
        'package.json',
      ],
      dest: './dist/dist.zip',
    },
    unzip: {
      src: './dist.zip',
      dest: './',
      all: true,
    },
  }
}