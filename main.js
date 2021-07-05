var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js');
var sanitizeHtml = require('sanitize-html');
/*var template = {
    HTML: function(title, list, body, control){
        return `
        <!doctype html>
        <html>
        <head>
        <title>node.js - ${title}</title>
        <meta charset="utf-8">
        </head>
            <body>
                <h1><a href="/">Node.js</a></h1>
                ${list}
                ${control}
                ${body}
                </p>
            </body>
        </html>`
    },
    list: function(filelist){
        var list = '<ol>';
        var i = 0;
        while(i < filelist.length) {
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i++;
        }
        list = list+'</ol>';
        return list;
    }     
}
*/
var app = http.createServer(function (request, response) { // 
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname, title);
    if (pathname == '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function(err,filelist){
                var title = "Welcome";
                var description = "Hello, Node.js"
                var list = template.list(filelist);
                var html = template.HTML(title, list, 
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">Create</a>`
                    );
                response.writeHead(200);
                response.end(html);
            })
        } else {
            fs.readdir('./data', function(err,filelist){
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescriptiion = sanitizeHtml(description);
                    var list = template.list(filelist);
                    var html = template.HTML(title,list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescriptiion}`,
                        `<a href="/create">Create</a>
                         <a href="/update?id=${sanitizedTitle}">Update</a>
                         <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <p><input type="submit" value="delete"></p>
                         </form>`
                        );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create') {
        fs.readdir('./data', function(err,filelist){
            var title = "Web - Create";
            var list = template.list(filelist);
            var html = template.HTML(title, list, ` 
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
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){
        var body = ``;
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            })
        });

    } else if(pathname === '/update'){
        fs.readdir('./data', function(err,filelist){
            var filteredId = path.parse(queryData.id).base; // confine locations to /data/
            fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                var list = template.list(filelist);
                var html = template.HTML(title,list,
                    `
                    <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>
                    `,
                    `<a href="/create">Create</a> <a href="/update?id=${title}">Update</a>`
                    );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        var body = ``;
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(err){
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                })
            })
        });
    } else if(pathname === '/delete_process'){
        var body = ``;
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(err){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }   
});
app.listen(3000);