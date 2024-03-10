const express = require('express')
const app = express()
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartilMovie } = require('./schemas/movies')

app.use(express.json())
app.disable('x-powered-by')
app.get('/', (req, res) => {
  res.json({ message: 'Hola mundo' })
})

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'loque yo quiera'
]
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  // cuando la peticion es del mismo origin
  // http://localhost:1234 => http://localhost:1234 aqui no enviaria origin si al mismo origin XD
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.sendStatus(200)
})

app.get('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  const origin = req.header('origin')
  // cuando la peticion es del mismo origin
  // http://localhost:1234 => http://localhost:1234 aqui no enviaria origin si al mismo origin XD
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  }
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path to regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Not Found Error 404' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  // console.log(title, genre, year, duration, rate, poster, director, req.body)
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  // cuando la peticion es del mismo origin
  // http://localhost:1234 => http://localhost:1234 aqui no enviaria origin si al mismo origin XD
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  }
  // const result = validatePartilMovie(req.body)
  // if (!result.success) {
  //   return res.status(404).json({ error: JSON.parse(result.error.message) })
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  console.log({ movieIndex }, { id })

  if (movieIndex === -1) {
    return res.status(404).json({ messae: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie Deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartilMovie(req.body)
  if (!result.success) {
    return res.status(404).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ messae: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  console.log(result.data, { updateMovie }, movies[movieIndex])

  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`listening server on PORT : http://localhost:${PORT}/`)
})
