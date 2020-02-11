const Koa = require('koa');
const koaBody = require('koa-body');
const error = require('koa-json-error');
const koaStatic = require('koa-static');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const path = require('path');
const mongodbClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/students";
//这里我使用了本地的mongoDB数据库，后面的students表示我在数据库里已经创建的这一张表，关于怎么创建一个表，百度之
const { connectionStr } = require('./config');
const routing = require('./routes');
const app = new Koa();
// app.use(bodyparser());//这个解析要放在前面，不然添加用户得时候会根据request参数来解析，如果不放在前面，解析参数会失败

app.use(koaStatic(path.join(__dirname, 'public')));


app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,
    },
}));
mongoose.connect(url, () => console.log('MongoDb 链接成功了'));
mongoose.connection.on('error', console.error);

app.use(parameter(app));
routing(app);
//nodemon:自动加载，不许重启
app.listen(3000, () => console.log('程序启动在 3000 端口了'));
