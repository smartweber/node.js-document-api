require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.json())

const generateUpdateStatementRouter = require('./routes/documents')
app.use('/generateUpdateStatement', generateUpdateStatementRouter)

module.exports = app
