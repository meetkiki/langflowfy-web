const {defineConfig} = require('@vue/cli-service')

process.env = { ...process.env, ...require('dotenv').config().parsed };

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port:3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 你的后端服务器地址
                ws: true, // 是否代理websockets
                changeOrigin: true, // 是否改变源地址
                pathRewrite: {
                    '^/api': '/api'  //实际请求地址是http://baidu.com/api/news/list
                }
            }
        }
    }
})
