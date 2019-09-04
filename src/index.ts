import * as express from 'express'
import * as bodyParser from 'body-parser'
import Photon from '@generated/photon'

const app = express()
app.use(bodyParser.json())

const photon = new Photon({ debug: true })

app.get('/posts', async (req, res) => {
    const posts = await photon.posts.findMany()
    res.json(posts)
})

app.get('/posts/:category', async (req, res) => {
    const { categoryreq } = req.query
    const posts = await photon.posts.findMany({
        where: {
            postCategoriesCategory: categoryreq
        }
      })
    res.json(posts)
})

app.get(`/posts/:id`, async (req, res) => {
    const { id } = req.params
    const post = await photon.posts.findOne({ 
        where: { 
            id,
        },
    })
    res.json(post)
})
  
app.post(`/posts`, async (req, res) => {
  const { text, title } = req.body
  const post = await photon.posts.create({
    data: {
        text,
        title,
    },
  })
  res.json(post)
})

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params
  const { text, title } = req.body
  const post = await photon.posts.update({
    where: { id },
    data: { text, title },
  })
  res.json(post)
})

app.delete(`/posts/:id`, async (req, res) => {
  const { id } = req.params
  const post = await photon.posts.delete({ 
      where: { 
          id,
      },
  })
  res.json(post)
})

app.listen(3000, () =>
  console.log('Server is running on http://localhost:3000'),
)