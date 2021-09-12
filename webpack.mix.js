let mix = require('laravel-mix')

// Compile To Test Environment Folder
mix.js('helper.js', '../talio_static').setPublicPath('../') 
