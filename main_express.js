// main_express.js Express() framework!!
// expressjs.com
const express = require('express');
const app = express();
const port = 3000;
var fs = require('fs');
var template = require('./lib/template.js');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false})); // 사용자가 보내 POST를 내부적으로 분석해서 
app.use(express.static('public')); // images폴더에 static file 접근

// app.use(function(req, res, next){ // custom middleware to read file list for all request due to "app.USE"
app.get('*', function(req, res, next){ // applies to all "get" request [app.get('*')]
    fs.readdir('./data', function(error, filelist){
        req.list = filelist;
        next();
    })
})

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
            `<a href="/create">Create</a>`
            );
        res.send(html);
    //})
})

// 선택된 page display
app.get('/page/:pageId', function(req, res) {
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
                    `<a href="/create">Create</a>
                    <a href="/update/${sanitizedTitle}">Update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <p><input type="submit" value="delete"></p>
                    </form>`
                    );
                res.send(html); // json값으로 return
            }
            
        });
    //});
})

app.get('/create', function(req, res){
    //fs.readdir('./data', function(err,filelist){
        const title = "Web - Create";
        let list = template.list(req.list);
        const html = template.HTML(title, list, ` 
            <form action="http://localhost:3000/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
        `,'');
        res.send(html);
    //});
})

app.post('/create_process', function(req, res){
    let post = req.body;
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.writeHead(302, {location: '/'});
        res.end();
    })

    /* using bodyParser middleware !!
    var body = ``;
    req.on('data', function(data){ // called whenever a data comes in
        body = body + data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                res.writeHead(302, {Location: `/`});
                res.end();
            })
        })
    });
    */
})

app.get('/update/:pageId', function(req, res){
    //fs.readdir('./data', function(err,filelist){
        var filteredId = path.parse(req.params.pageId).base; // confine locations to /data/
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
            var title = req.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var list = template.list(req.list);
            var html = template.HTML(title,list,
                `
                <form action="/update_process" method="post">
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
                `<a href="/create">Create</a> <a href="/update">Update</a>`
                );
            res.send(html);
        });
    //});
})

app.post('/delete_process', function(req, res){
    /* using bodyParser middleware !!
    var body = '';
    req.on('data', function(data){
        body = body + data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
          res.redirect('/');
        })
    });
    */
var post = req.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
        res.redirect('/');
    })
});

  app.post('/update_process', function(req, res){
    /* using bodyParser middleware !!
    var body = '';
    req.on('data', function(data){
        body = body + data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            res.redirect(`/page/${title}`);
          })
        });
    });
    */
    let post = req.body;
    let id = post.id;
    let title = post.title;
    let description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          res.redirect(`/page/${title}`);
        })
      });
  });

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