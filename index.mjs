// for Passport
import { Router } from 'express';
var router = Router();
import { list as _list, HTML } from '../lib/pass_template.mjs'; // 'js' extension can be skipped
import { statusUI } from '../lib/auth.mjs';

router.get('/', function (req, res) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = _list(req.list);
    var html = HTML(title, list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
        `,
        `<a href="/topic/create">create</a>`,
        statusUI(req, res)
        );
        res.send(html);
    });

export default router;  