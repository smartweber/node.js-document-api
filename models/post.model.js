const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  value: {
    type: String,
    required: true
  },
  mentions: {
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mention' }],
		default: () => []
	}
})

module.exports = mongoose.model('Post', postSchema)
