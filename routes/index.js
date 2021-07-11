var express = require('express');
var router = express.Router();
var template = require('../lib/exp_sess_ck_template'); // 'js' extension can be skipped
var auth = require('../lib/auth');

router.get('/', function (req, res) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(req.list);
    var html = template.HTML(title, list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
        `,
        `<a href="/topic/create">create</a>`,
        auth.statusUI(req, res)
        );
        res.send(html);
    });

module.exports = router;  