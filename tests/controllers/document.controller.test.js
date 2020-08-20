const request = require('supertest')
const app = require('../../server')
const Person = require('../../models/person.model')
const Post = require('../../models/post.model')
require('../utils')

describe('#generateUpdateStatement endpoints', () => {
  let person;
  beforeEach(async () => {
    const p = new Person({
      name: 'Mark Cuban'
    })
    person = await p.save()
  })

  afterEach(async () => {
    if (person) {
      person.remove()
    }
  })

  it('should create a new Person with name', async (done) => {
    const res = await request(app)
      .post('/generateUpdateStatement')
      .send({
        person: {
          name: 'John Mayer'
        }
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.data).toHaveProperty('$add')
    done()
  })

  it('should create a new Post with value', async (done) => {
    const data = {
      person: {
        _id: person.id,
        posts: [{
          value: 'todo'
        }]
      }
    }
    const res = await request(app)
      .post('/generateUpdateStatement')
      .send(data)
    expect(res.statusCode).toEqual(200)
    expect(res.body.data).toHaveProperty('$add')
    done()
  })

  it('should update Post value with _id', async (done) => {
    const post = new Post({
      value: 'todo'
    })
    const newPost = await post.save()

    person.posts.push(newPost._id)
    await person.save()

    const data = {
      person: {
        _id: person.id,
        posts: [{
          _id: newPost._id,
          value: 'todo1'
        }]
      }
    }
    const res = await request(app)
      .post('/generateUpdateStatement')
      .send(data)
    expect(res.statusCode).toEqual(200)
    expect(res.body.data).toEqual(
      {
        $update: { "posts.0.value": "todo1" }
      }
    )
    done()
  })

  it('should update Post value with _id', async (done) => {
    const post = new Post({
      value: 'todo'
    })
    const newPost = await post.save()

    person.posts.push(newPost._id)
    await person.save()

    const data = {
      person: {
        _id: person.id,
        posts: [{
          _id: newPost._id,
          _delete: true
        }]
      }
    }
    const res = await request(app)
      .post('/generateUpdateStatement')
      .send(data)
    expect(res.statusCode).toEqual(200)
    expect(res.body.data).toEqual(
      {
        $remove: { "posts.0": true }
      }
    )
    done()
  })
})
