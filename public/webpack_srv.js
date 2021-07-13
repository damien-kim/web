const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();


app.use(express.static(__dirname));

app.get('*', (req, res) => {
    if (req.path.endsWith('bundle.js')) {
        res.sendFile(path.resolve(__dirname, 'bundle.js'));
    } else {
        console.log(__dirname);
        res.sendFile(path.resolve(__dirname, './webpack/public/index.html'));
    }
});

app.listen(port, () => {
    console.log('listening on port ' + port);
    console.log(__dirname);
});