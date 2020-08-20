const Person = require('../models/person.model')
const Post = require('../models/post.model')
const Mention = require('../models/mention.model')

async function createPerson(name) {
  const person = new Person({
    name: name
  })
  await person.save()
}

async function createPost(person, value) {
  const post = new Post({
    value: value
  })
  const newPost = await post.save()

  person.posts.push(newPost._id)
  return await person.save()
}

async function updatePost(person, post, value) {
  post.value = value
  await post.save()
  return person.posts.indexOf(post._id)
}

async function removePost(person, post) {
  const postIndex = person.posts.indexOf(post._id)
  if (postIndex > -1) {
    person.posts.splice(postIndex, 1)
  }
  const updatedPerson = await person.save()
  await post.remove()
  return {
    person: updatedPerson,
    index: postIndex
  }
}

async function createMention(post, text) {
  const mention = new Mention({
    text: text
  })
  const newMention = await mention.save()
  post.mentions.push(newMention._id)
  return await post.save()
}

async function updateMention(post, mention, text) {
  mention.text = text
  await mention.save()
  return post.mentions.indexOf(mention._id)
}

async function removeMention(post, mention) {
  const mentionIndex = post.mentions.indexOf(mention._id)
  if (mentionIndex > -1) {
    post.mentions.splice(mentionIndex, 1)
  }
  const updatedPost = await post.save()
  await mention.remove()
  return {
    post: updatedPost,
    index: mentionIndex
  }
}

async function handleDocument(req, res, next) {
  try {
    if (!req.body.person) {
      return res.status(404).json({ message: 'person is required'})
    }

    const personData = req.body.person

    if (personData.name) {
      await createPerson(personData.name)
      const data = {
        $add: {
          people: { name: personData.name }
        }
      }
      return res.status(200).json({
        status: 'succes',
        data: data,
      })
    }

    let personRecord = await Person.findById(personData._id)

    if (personRecord == null) {
      return res.status(404).json({ message: 'Invalid person _id'})
    }

    if (!personData.posts) {
      return res.status(404).json({ message: 'No person posts'})
    }

    const posts = personData.posts
    const results = {}

    for (let i = 0; i < posts.length; i++) {
      const postData = posts[i]

      if (postData._id) {
        let postRecord = await Post.findById(postData._id)

        if (postRecord == null) {
          return res.status(404).json({ message: 'Invalid post _id'})
        }

        if (postData.value) {
          // update post
          const updatePostInd = await updatePost(personRecord, postRecord, postData.value)
          const r = {}
          r[`posts.${updatePostInd}.value`] = postData.value
          results['$update'] = r
        } else if (postData._delete) {
          // remove post
          const removePostRes = await removePost(personRecord, postRecord)
          personRecord = removePostRes.person
          const r = {}
          r[`posts.${removePostRes.index}`] = true
          results['$remove'] = r
        } else if (postData.mentions && postData.mentions.length > 0) {
          const postIndex = personRecord.posts.indexOf(postRecord._id)

          if (postIndex === -1) {
            return res.status(404).json({ message: 'Invalid post _id in this person'})
          }

          for (let j = 0; j < postData.mentions.length; j++) {
            const mentionData = postData.mentions[j]

            if (mentionData._id) {
              let mentionRecord = await Mention.findById(mentionData._id)

              if (mentionRecord == null) {
                return res.status(404).json({ message: 'Invalid mention _id'})
              }

              if (mentionData.text) {
                // update mention
                const updateMentionInd = await updateMention(postRecord, mentionRecord, mentionData.text)
                const r = {}
                r[`posts.${postIndex}.mentions${updateMentionInd}.text`] = mentionData.text
                results['$update'] = r
              } else if (mentionData._delete) {
                // remove mention
                const removeMentionRes = await removeMention(postRecord, mentionRecord)
                const r = {}
                r[`posts.${postIndex}.mentions${removeMentionRes.index}`] = true
                results['$remove'] = r
                postRecord = removeMentionRes.post
              }
            } else if (mentionData.text) {
              // create mention
              postRecord = await createMention(postRecord, mentionData.text)
              const r = {}
              r[`posts.${postIndex}.mentions`] = { text: mentionData.text }
              results['$add'] = r
            }
          }
        }
      } else if (postData.value) {
        // create post
        personRecord = await createPost(personRecord, postData.value)
        const r = {}
        r['posts'] = { value: postData.value }
        results['$add'] = r
      }
    }

    res.status(200).json({
      status: 'succes',
      data: results,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { handleDocument }