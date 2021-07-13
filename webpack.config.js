const path = require('path') 
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry:{
        index:"./source/index.js",
        about:"./source/about.js"
    },
    output:{
        path:path.resolve(__dirname, 'public'),
        filename:'[name]_bundle.js', // '[name]' = entry name in "entry" section
        publicPath: '/'
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:[
                    'style-loader', // this load is run second
                    'css-loader'    // this load is run first
                ]

            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./source/index.html',
            filename:'./index.html',
            chunks:['index']
        }),
        new HtmlWebpackPlugin({
            template:'./source/about.html',
            filename:'./about.html',
            chunks:['about']
        }),
    ]
}