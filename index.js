require('./.pnp.cjs').setup(); // yarn

const express = require('express');

const app = express();

const comments = {
    "user": "comment",
    "user232": "comment222",
    "use32323r": "assss",
};

app.use(express.json());

app.use(express.static('public'));
app.get('/comments', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(comments));
});

app.post('/comments', (req, res) => {
    const json = req.body;
    comments[json.name] = json.comment;
    res.send('ok');
})

app.listen(3000, () => console.log('Server started on http://localhost:3000'));