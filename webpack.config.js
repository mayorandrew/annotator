const {resolve} = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    devtool: 'source-map',
    entry: {
        app: ['./app.jsx']
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'public/build'),
        publicPath: '/'
    },
    context: resolve(__dirname, 'frontend'),
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loaders: [
                    'babel-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(css|scss)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader?sourceMap&-url&-minimize',
                        'postcss-loader',
                        'sass-loader?sourceMap'
                    ]
                })
            },
            {test: /\.(png|jpg)$/, use: 'url-loader?limit=15000'},
            {test: /\.eot(\?v=\d+.\d+.\d+)?$/, use: 'file-loader'},
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml'}
        ]
    },
    plugins: [
        new ExtractTextPlugin({filename: '[name].css', disable: false, allChunks: true})
    ]
};

module.exports = config;
