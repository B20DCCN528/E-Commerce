const express = require('express')
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')

require('dotenv').config()

const app = express()
const port = process.env.port || 8888
app.use(express.json())
app.use(express.urlencoded({extended : true}))
dbConnect()
initRoutes(app)

app.use('/', (req, res) => (res.send('SERVER ONN')))

app.listen(port, () => {
    console.log('Server running on the port: ' + port);
})