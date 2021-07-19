// For Passport!!
// 매들웨어는 순서가 매우 중요함. Router들의 순서가 var passport = require~ 보다 위에 있으면 passport가 인식되지 않음
// https://www.npmjs.com/package/lowdb refer to this linke for getting idea on ES6 exports
import express from 'express';
var app = express();
const port = 3000;
import { readdir } from 'fs';
// import { urlencoded } from 'body-parser';
// var bodyParser = require('body-parser')
import compression from 'compression';
import helmet from 'helmet';

import session from 'express-session';
import FileStore1 from 'session-file-store';
var FileStore = FileStore1(session);
// var FileStore = require('session-file-store')(session)
import flash from 'connect-flash';
import {db} from '../lib/dB.mjs'

app.use(helmet());
app.use(express.static('../public')); // images폴더에 static file 접근
app.use(express.urlencoded({ extended: false})); // 사용자가 보내 POST를 내부적으로 분석해서 
app.use(compression()); // compress the contents
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg', 
    resave: false,
    saveUninitialized: true,
    store:new FileStore()
}))
app.use(flash());

// var passport = require('../lib/passport.js').default(app);
import _passport from '../lib/passport.mjs'
// const passport = _passport.default(app);
const passport = _passport(app);

app.get('*', function(req, res, next){ // applies to all "get" request [app.get('*')], *** the order of middleware is very critical
    req.list = db.data.topics;
        next();
})

import topicRouter from '../routes/topic.mjs'
import indexRouter from '../routes/index.mjs'
import _authRouter from '../routes/auth.mjs';

let authRouter = _authRouter(passport);

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
  console.log(`lowdb app listening at http://localhost:${port}`)
})
