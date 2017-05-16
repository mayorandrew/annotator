const postcssSmartImport = require('postcss-smart-import');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');
module.exports = {
    plugins: [
        postcssSmartImport({
            addDependencyTo: webpack
        }),
        autoprefixer({ browsers: ['ie >= 10', 'last 2 versions', '> 5%'] })
    ]
};
