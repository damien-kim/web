//   for Passport

import express, { response } from 'express';
var router = express.Router(); // express가 보유한 Router()메소드를 호출 후 router를 리턴
import { parse } from 'path';
import { writeFile, readFile, unlink, rename } from 'fs';
import sanitizeHtml from 'sanitize-html';
import { list as _list, HTML } from '../lib/pass_template.mjs';
import { isOwner, statusUI } from '../lib/auth.mjs';
import { db, jsonFunc, usersDb, topicsDb } from '../lib/dB.mjs';
import shortid from 'shortid';
import { request } from 'http';
import { EDESTADDRREQ } from 'constants';


// var qs = require('querystring');

router.get('/create', function (req, res) {
    if (!isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    const title = "Web - Create";
    let list = _list(req.list);
    const html = HTML(title, list, ` 
            <form action="http://localhost:3000/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
        `, '', statusUI(req, res));
    res.send(html);
    //});
})

router.post('/create_process', function (req, res) {
    if (!isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let post = req.body;
    let title = post.title;
    let description = post.description;
    let id = shortid.generate();
    db.data.topics.push({
        id: id,
        title: title,
        description: description,
        user_id: req.user.id
    })
    db.write();
    res.redirect(`/topic/${id}`);
})

router.get('/update/:pageId', function (req, res) {
    if (!isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let num = jsonFunc(req.params.pageId, topicsDb);
    let topic = db.data.topics[num];
    req.flash('error', 'Not your post!!');
    console.log('topic num:'+ topic, 'req.user.id: ' + req.user.id)
    // if (topic.user_id !== req.user.id) {
    //     req.flash('error', 'Not your post!!');
    //     return res.redirect('/');
    // }
    let title = topic.title;
    let description = topic.description;
    var list = _list(req.list);
    var html = HTML(title, list,
        `
        <form action="/topic/update_process" method="post">
        <input type="hidden" name="id" value="${topic.id}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
            <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
        `,
        `<a href="/topic/create">Create</a> <a href="/topic/update/${topic.id}">Update</a>`,
        statusUI(req, res)
    );
    res.send(html);
})

router.post('/delete_process', function (req, res) {
    if (!isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let post = req.body;
    console.log(req.body);
    let id = post.id;
    console.log('post.id: '+id);
    let num = jsonFunc(id, topicsDb);
    let topic = db.data.topics[num];
    console.log('post.id: '+id, 'num: '+num);

    if (db.data.topics.length === num || (topic.user_id !== req.user.id)) {
        req.flash('error', "Not your posting!!");
        return res.redirect('/');
    }
    db.data.topics.splice(num, 1) // delete (topic-1)'th element
    db.write();
    res.redirect('/');
});

router.post('/update_process', function (req, res) {
    if (!isOwner(req, res)) {
        res.redirect('/');
        return false; // end the module so that the rest of the code won't be run
    }
    let post = req.body;
    let id = post.id;
    let title = post.title;
    let description = post.description;
    let topicId = jsonFunc(post.id, topicsDb);
    console.log ('post.id: ' + post.id, 'req.user.id: '+ req.user.id)
    if (db.data.topics[topicId].user_id !== req.user.id) {
        req.flash('error', 'You are not the owner!!');
        return res.redirect('/'); // return으로 완전히 종료되었기 때문에 else가 필요치 않음
    }
    db.data.topics[topicId].title = title;
    db.data.topics[topicId].description = description;
    db.write();
    res.redirect(`/topic/${post.id}`);
});

router.get('/:pageId', function (req, res, next) {
    let num = jsonFunc(req.params.pageId, topicsDb); // get pageID in number
    let topic = db.data.topics[num];
    let uid = jsonFunc(topic.user_id, usersDb); //search topics.user_id in usersDb to figure out owner of document to display "user.displayName"
    let user = db.data.users[uid];

    const sanitizedTitle = sanitizeHtml(topic.title);
    const sanitizedDescription = sanitizeHtml(topic.description);
    const list = _list(req.list);
    var html = HTML(sanitizedTitle, list,
        `
        <h2>${sanitizedTitle}</h2>${sanitizedDescription}
        <p style="text-decoration-line: underline">By ${user.displayName}</p>`, // returned object중 displayName 사용
        `<a href="/topic/create">Create</a>
                <a href="/topic/update/${topic.id}">Update</a>
                <form action="/topic/delete_process" method="post">
                    <input type="hidden" name="id" value="${topic.id}">
                    <p><input type="submit" value="delete"></p>
                </form>`,
        statusUI(req, res)
    );
    res.send(html); // json값으로 return

})

export default router;