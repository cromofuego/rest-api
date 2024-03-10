const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horro', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Moviegenre is required',
      invalid_type_error: 'Movie must be a Enum of some date'
    }
  )
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartilMovie (input) {
  return movieSchema.partial().safeParse(input) // todas la spropiedades opcionales y si pasa una del schmea se validara
}

module.exports = {
  validateMovie,
  validatePartilMovie
}
