import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors())



app.get('/api', (req, res) => {
    res.send('Server is ready')
})

// get a list of 5 jokes
app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            joke: 'Why did the chicken cross the road?'
        },
        {
            id: 2,
            joke: 'Why did the chicken cross the road? To get to the other side2.'
        },
        {
            id: 3,
            joke: 'Why did the chicken cross the road? To get to the other side3.'
        },
        {
            id: 4,
            joke: 'Why did the chicken cross the road? To get to the other side4.'
        },
        {
            id: 5,
            joke: 'Why did the chicken cross the road? To get to the other side5.'
        }
    ]
    console.log("jokes", jokes);
    res.send(jokes);
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})