let mix = require('laravel-mix')

// Compile And Copy To Test Environment Folder
mix.js('heatmap.js', '/dist')
mix.js('utils.js', '/dist')
mix.js('index.js', '/dist')
mix.copy('./dist/index.js', '../talio_static/helper.js')
