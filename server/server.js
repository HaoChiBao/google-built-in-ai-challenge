const markdownToHTML = require('./functions/markdown')

const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    console.log('get')

    // res.status(500).json({message: 'Hello World!'})
    res.json({message: 'Hello World!'})
    // res.download('index.js')
})

app.post('/markdown', (req, res) => {
    const data = req.body
    if (data.text){
        const response = markdownToHTML(data.text)
        res.json({html: response})
    } else {
        res.status(500).send({ error: 'no provided text' })
    }
})


app.listen(port)


