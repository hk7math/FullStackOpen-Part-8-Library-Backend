const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('connected to MongoDB')
}).catch(error => {
  console.log('error connection to MongoDB: ', error.message)
})

const typeDefs = gql`
  type Book {
    id: ID!,
    title: String!,
    published: Int!,
    author: Author!,
    genres: [String!]!
  }
  type Author {
    id: ID,
    name: String!,
    born: Int,
    bookCount: Int!
  }
  type Query {
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!]!,
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!,
      author: String!,
      published: Int!,
      genres: [String]!
    ): Book,
    editAuthor(
      name: String!,
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => books.filter(book => 
      (!args.author || args.author === book.author)
      && (!args.genre || book.genres.includes(args.genre))),
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => books.filter(book => book.author == root.name).length
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      if (!authors.filter(author => author.name === args.author).length) {
        authors = authors.concat({ name: args.author, id: uuid() })
      }
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(author => author.name === args.name)
      if (!author) return null
      author.born = args.setBornTo
      authors = authors.map(x => x.name === args.name ? author : x)
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})