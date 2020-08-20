const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  name: {
    type: String,
    required: true
  },
  posts: {
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
		default: () => []
	}
})

module.exports = mongoose.model('Person', personSchema)
