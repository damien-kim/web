//   for Passport /routes/auth.js
var express = require('express')
var router = express.Router(); // express가 보유한 Router()메소드를 호출 후 router를 리턴
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/exp_sess_ck_template.js');


module.exports = function (passport) {
  router.get('/login', function(req, res){
    const fmsg = req.flash();
    let feedback = '';
    if(fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "Web - login";
    let list = template.list(req.list);
    const html = template.HTML(title, list, ` 
        <div style="color:red;">${feedback}</dev>
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
  
  router.post('/login_process', 
    passport.authenticate('local', {
      failureRedirect: '/auth/login',
      failureFlash: true}), 
      (req, res) => {
        req.session.save(() => {
          res.redirect('/')
        })
      }    
  )  
  
  // logout module
  router.get('/logout', function(req, res){
    req.logout(); // call by passport
    // req.session.destroy(function(err){  // 현재의 세션을 지움
    req.session.save(function(){ // 현재의 세션 상태를 저장한 다음 종료
      res.redirect('/')
    })
  })
  return router;
};

