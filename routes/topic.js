//   routers
var express = require('express');
var router = express.Router(); // express가 보유한 Router()메소드를 호출 후 router를 리턴
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
// var template = require('../lib/template.js'); // for main_express
var template = require('../lib/exp_sess_ck_template.js');
var auth = require('../lib/auth');
// var qs = require('querystring');

router.get('/create', function(req, res){
    if(!auth.isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
        const title = "Web - Create";
        let list = template.list(req.list);
        const html = template.HTML(title, list, ` 
            <form action="http://localhost:3000/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
        `,'',auth.statusUI(req, res));
        res.send(html);
    //});
})

router.post('/create_process', function(req, res){
    if(!auth.isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let post = req.body;
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.writeHead(302, {location: `/topic/${title}`});
        res.end();
    })
})

router.get('/update/:pageId', function(req, res){
    if(!auth.isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
        var filteredId = path.parse(req.params.pageId).base; // confine locations to /data/
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
            var title = req.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var list = template.list(req.list);
            var html = template.HTML(title,list,
                `
                <form action="/topic/update_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizedTitle}"></p>
                <p>
                    <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
                `,
                `<a href="/topic/create">Create</a> <a href="/topic/update">Update</a>`,
                auth.statusUI(req, res)
                );
            res.send(html);
        });
})

router.post('/delete_process', function(req, res){
    if(!auth.isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    var post = req.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
            res.redirect('/');
        })
});

router.post('/update_process', function(req, res){
    if(!auth.isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let post = req.body;
    let id = post.id;
    let title = post.title;
    let description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            res.redirect(`/topic/${title}`);
        })
    });
});

router.get('/:pageId', function(req, res, next) {
//fs.readdir('./data', function(err,filelist){
    var filteredId = path.parse(req.params.pageId).base; // display할 ID
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if (err) {
                return next(err);
        } else {
            const title = req.params.pageId;
            const sanitizedTitle = sanitizeHtml(title);
            const sanitizedDescription = sanitizeHtml(description);
            const list = template.list(req.list);
            var html = template.HTML(title,list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/topic/create">Create</a>
                <a href="/topic/update/${sanitizedTitle}">Update</a>
                <form action="/topic/delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <p><input type="submit" value="delete"></p>
                </form>`,
                auth.statusUI(req, res)
                );
            res.send(html); // json값으로 return
        }
        
    });
//});
})    

module.exports = router;