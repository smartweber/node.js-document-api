const mongoose = require('mongoose')

const mentionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  text: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Mention', mentionSchema)
