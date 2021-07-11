// main_express.js Express() framework!!
// expressjs.com
const express = require('express');
const app = express();
const port = 3000;
var fs = require('fs');
var template = require('./lib/template.js');
// var qs = require('querystring');
// var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var topicRouter = require('./routes/topic');
var helmet = require('helmet');

app.use(helmet());

app.use(express.static('public')); // images폴더에 static file 접근
app.use(bodyParser.urlencoded({ extended: false})); // 사용자가 보내 POST를 내부적으로 분석해서 
app.use(compression()); // compress the contents
app.get('*', function(req, res, next){ // applies to all "get" request [app.get('*')], *** the order of middleware is very critical
    fs.readdir('./data', function(error, filelist){
        req.list = filelist;
        next();
    })
})

app.use('/topic', topicRouter); // '/topic'으로 시작되는 route에 대해 topicRouter를 사용
// app.use(function(req, res, next){ // custom middleware to read file list for all request due to "app.USE"


// app.get ('path'에 해당 하는 function혹은 미들웨어 가 실행됨
// Main page loading
app.get('/', (req, res) => {
    //fs.readdir('./data', function(err,filelist){
        var title = "Welcome";
        var description = "Hello, Node.js"
        var list = template.list(req.list);
        var html = template.HTML(title, list, 
            `
            <h2>${title}</h2>${description}
            <img src="/images/hello.jpg" style="width:150px; display:block; margin-top:10px">
            `,
            `<a href="/topic/create">Create</a>`
            );
        res.send(html);
    //})
})

app.use(function(req, res, next){ // 미들웨어는 순차적으로 처리되기 때문에 마지막 에러 처리를 위함. 순서가 중요함
    res.status(404).send('File Not Found');
})

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('something is broken');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
// end of main_express.js