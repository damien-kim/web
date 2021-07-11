//   routers
var express = require('express')
var router = express.Router(); // express가 보유한 Router()메소드를 호출 후 router를 리턴
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/exp_sess_ck_template.js');

var authData = {
  email: 'damien.seoul@gmail.com',
  password: '1111',
  nickname: 'damienGim'
}

router.get('/login', function(req, res){
  const title = "Web - login";
  let list = template.list(req.list);
  const html = template.HTML(title, list, ` 
      <form action="http://localhost:3000/auth/login_process" method="post">
      <p><input type="text" name="email" placeholder="email"></p>
      <p><input type="password" name="pwd" placeholder="password"></p>
      <p>
          <input type="submit" value="login">
      </p>
      </form>
  `,'');
  res.send(html);
})

// login module
router.post('/login_process', function(req, res){
    let post = req.body;
    let email = post.email;
    let password = post.pwd;
    if(email === authData.email && password === authData.password) {
      req.session.is_logined = true;
      req.session.nickname = authData.nickname;
      req.session.save(function(){ // to save session info into local before executing the next code
        res.redirect('/');
      })
      
    } else {
      res.send('Auth is required!')
    }
})

// logout module
router.get('/logout', function(req, res){
  req.session.destroy(function(err){
    res.redirect('/');
  })
})

module.exports = router;

