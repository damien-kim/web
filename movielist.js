// Movie info, Poster upload
// 1. 목록 축력
// 2. Post 요청 처리
// 3. 영화 포스트
// 4. 포스트 업로드 기능 추가

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var initialDB = fs.readFileSync('./initialDB.json');
var movieList = JSON.parse(initialDB);
var pathUtil = require('path');
var url = require('url');
var formidable = require('formidable');

var uploadDir = __dirname + '/upload'; // formidable requires a temporary folder
var imageDir = __dirname + '/images'; // images are loaded to this folder later

var server = http.createServer(function(req, res){
    if(req.method.toLowerCase() == 'get' && req.url == '/') {
        showList(req, res);
    } 
    else if(req.method.toLowerCase() == 'get') {
        // 이미지
        var parsed = url.parse(req.url);
        var path = __dirname + parsed.pathname; // '__dirname' = current path + /images/imagefile.jpg
        fs.access(path, function(err) { //?
            if (err) {
                res.statusCode = 404;
                res.end('Not Found');
                return;
            }
            var is = fs.createReadStream(path); // reads the image file with 64 kb highwatermark
            is.pipe(res); // sends the stream to writable
        });
    } 
    else if(req.method.toLowerCase() === 'post') {
        addNewMovie(req, res);
    } 
    else {
        res.statusCode = 400;
        res.end('Error');
    }
    
});
server.listen(3001);

function addNewMovie(req, res){
    var form = new formidable.IncomingForm();
    form.keepExtension = true;
    form.uploadDir = uploadDir;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.statusCode = 404;
            res.end('Error');
            return;
        }
        var title = fields.title;
        var director = fields.director;
        var year = fields.year;

        var poster = files.poster; // image file
        var ext = pathUtil.extname(poster.name); //get the extension of the image file
        var newFileName = title + ext;
        var newPath = imageDir + pathUtil.sep + newFileName; 

        fs.renameSync(poster.path, newPath);
        var url = '/images' + newFileName; // /images/image-file-name.ext

        var info = {
            title : title,
            director : director,
            year : year,
            poster : url
        };
        movieList.push(info);

        res.statusCode = 302;
        res.setHeader('Location', '.'); //'.' -> current directory
        res.end();
    });
}

function showList(req, res) {
    var html = '<html>';
    html += '<head>';
    html += '<meta charset="UTF8">';
    html += '<style>';
    html += 'form label { width:100px; display:inline-block; }';
    html += 'li img { height:100px }';
    html += '</style>';
    html += '</head>';
    html += '<body>';
    html += '<h1>Favorite Movie</h1>';
    html += '<div>';
    html += '<ul>';
    movieList.forEach(function(movie) {
        html += '<li>';
        if(movie.poster) {
            html += '<img src="'+ movie.poster +'">';
        }
        html += movie.title+ '(' + movie.director + ',' + movie.year + ')' + '</li>';
    });
    html += '</ul>';
    html += '</div>';

    html += '<form method="post" action="." enctype="multipart/form-data">'; // "enctype" to load file
    html += '<h4> type new movie</h4>';
    html += '<ul>';
    html += '<li><lable>Movie title </label><input type="text" name="title"></li>';
    html += '<li><lable>Director </label><input type="text" name="director"></li>';
    html += '<li><lable>Year </label><input type="text" name="year"></li>';
    html += '<li><lable>Poster </label><input type="file" name="poster"></li>';
    html += '</ul>';
    html += '<input type="submit" value="upload">';
    html += '</form>';

    html += '</body>';
    html += '</html>';
    res.writeHeader(200, {'Content-Type':'text/html'});
    res.end(html);
}