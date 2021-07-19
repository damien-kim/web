//   for Passport /routes/auth.mjs

// import shortid from 'shortid';

import { list as _list, HTML } from '../lib/pass_template.mjs';
import { Router } from 'express';
var router = Router(); // express가 보유한 Router()메소드를 호출 후 router를 리턴
import { db, jsonFunc } from '../lib/dB.mjs'
import shortid from 'shortid'

import bcrypt from 'bcrypt';
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
// import { join } from 'path'
// import { Low, JSONFile } from 'lowdb'
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import {dbID} from '../lib/dB.mjs'
// Use JSON file for storage

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const file = join(__dirname, 'db.json')
// const adapter = new JSONFile(file)
// const db = new Low(adapter)
// await db.read(); // JSONFile and JSONFileSync adapters will set db.data to null if file doesn't exist.
// if (!db.read()) { db.data ||= { users: [] } } // Set default data if db.read() returns null
// const users = db.data;

export default function (passport) {
  router.get('/login', function (req, res) {
    const fmsg = req.flash();
    let feedback = '';
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "Web - login";
    let list = _list(req.list);
    const html = HTML(title, list, ` 
        <div style="color:red;">${feedback}</dev>
        <form action="http://localhost:3000/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
            <input type="submit" value="login">
        </p>
        </form>
    `, '');
    res.send(html);
  })

  router.post('/login_process',
    passport.authenticate('local', {
      failureRedirect: '/auth/login',
      failureFlash: true
    }),
    (req, res) => {
      req.session.save(() => {
        res.redirect('/')
      })
    }
  )

  router.get('/register', function (req, res) {
    const fmsg = req.flash();
    let feedback = '';
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "Web - login";
    let list = _list(req.list);
    const html = HTML(title, list, ` 
        <div style="color:red;">${feedback}</dev>
        <form action="http://localhost:3000/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password"></p>
        <p><input type="text" name="displayName" placeholder="display name"></p>
        <p>
            <input type="submit" value="register">
        </p>
        </form>
    `, '');
    res.send(html);
  })

  router.post('/register_process', function (req, res) {
    let post = req.body;
    let email = post.email;
    let pwd = post.pwd;
    let pwd2 = post.pwd2;
    let displayName = post.displayName;
    if (pwd !== pwd2) {
      req.flash('error', 'Password must be same');
      res.redirect('/auth/register');
    } else {
      bcrypt.hash(pwd, saltRounds, function (err, hash) {
        let dbID = db.data.users.push({ // deID = 유저정보들이 들어 있는 배열의 ID
          id: shortid.generate(),
          email: email,
          password: hash, // save password in hash
          displayName: displayName
        })
        db.write();
        let user = db.data.users[dbID - 1]; //db 값이 '1'부터 생성되기 때문에 
        console.log('auth: ', user);
        req.login(user, function () {
          console.log('redirect');
          req.session.save(function (err) { // 이 함수가 없이는 deserializeUser가 구동되지 않음 
            return res.redirect('/');
          })
        })
      });
    }
  })

  // logout module
  router.get('/logout', function (req, res) {
    req.logout(); // call by passport
    // req.session.destroy(function(err){  // 현재의 세션을 지움
    req.session.save(function () { // 현재의 세션 상태를 저장한 다음 종료
      res.redirect('/')
    })
  })
  return router;
};

