var template = {
    HTML: function(title, list, body, control, authStatusUI = '<a href="/login">Login</a>'){
        return `
        <!doctype html>
        <html>
        <head>
        <title>node.js - ${title}</title>
        <meta charset="utf-8">
        </head>
            <body>
                ${authStatusUI}
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
            // list = list + `<li><a href="/id=${filelist[i]}">${filelist[i]}</a></li>`;
            list = list + `<li><a href="/page/${filelist[i]}">${filelist[i]}</a></li>`; // '링크를 /page/<id>형식 출력
            i++;
        }
        list = list+'</ol>';
        return list;
    }     
}
module.exports = template;