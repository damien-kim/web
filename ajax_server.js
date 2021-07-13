// Ajax test server

const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const host = 'localhost';
const port = 3002;

const requestListener = function (req, res) {
    const pathname = url.parse(req.url, true).pathname;

    if (pathname === '/') {
        fs.readFile('./fetch.html')
        .then(contents => { // contents paramter contains the HTML file's data
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })

    } else if (pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return; 

    } else {
        fs.readFile('.'+ pathname)
            .then(contents => { // contents paramter contains the HTML file's data
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
            })
            .catch(err => { // catch() method for catching error
                // res.writeHead(500);
                // res.end(err);
                res.end(err.toString());
            });

    }; 
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server for Ajax is running on http://${host}:${port}`);
});