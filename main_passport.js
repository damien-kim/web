// For Passport!!
// 매들웨어는 순서가 매우 중요함. Router들의 순서가 var passport = require~ 보다 위에 있으면 passport가 인식되지 않음
var express = require('express');
var app = express();
const port = 3000;
var fs = require('fs');
var template = require('./lib/exp_sess_ck_template.js');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');

var session = require('express-session');
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');

app.use(helmet());

app.use(express.static('public')); // images폴더에 static file 접근
app.use(bodyParser.urlencoded({ extended: false})); // 사용자가 보내 POST를 내부적으로 분석해서 
app.use(compression()); // compress the contents
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg', 
    resave: false,
    saveUninitialized: true,
    store:new FileStore()
}))
app.use(flash());

var passport = require('./lib/passport')(app);

app.get('*', function(req, res, next){ // applies to all "get" request [app.get('*')], *** the order of middleware is very critical
    fs.readdir('./data', function(error, filelist){
        req.list = filelist;
        next();
    })
})

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter); 
app.use('/topic', topicRouter); // '/topic'으로 시작되는 route에 대해 topicRouter를 사용
// app.use(function(req, res, next){ // custom middleware to read file list for all request due to "app.USE"
app.use('/auth', authRouter);

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