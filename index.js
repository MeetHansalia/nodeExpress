const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/twitter', (req, res) => {
    res.send('killerhyper2@gmail.com')
})

app.get('/login', (req, res) => {
    res.send('<h1>Plz login with meet permissions</h1>')
})

app.get('/logout', (req, res) => {
    res.send('<h2>You have been successfully logged out</h2>')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})