const express = require('express')
const router = express.Router()
const documentCtrl = require('../controllers/document.controller')

// Create one subscriber
router.post('/', documentCtrl.handleDocument)

module.exports = router
