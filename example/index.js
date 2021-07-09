const mercuriusPostGraphile = require('..')
const { Pool } = require('pg')
const DEFAULT_INFLECTOR = require('@graphile-contrib/pg-simplify-inflector')

const schema = `
  type Query {
    localUser(id: Int!): User
  }

  type User {
    id: Int!
    verified: Boolean
  }
`

const resolvers = {
  Query: {
    async localUser (obj, params, context) {
      return { id: params.id }
    }
  },
  User: {
    async verified () {
      return true
    }
  }
}

const connectionString = 'postgres://postgres:postgres@0.0.0.0:5432/postgres?sslmode=disable'

const pgPool = new Pool({ connectionString })

const postgraphileSchemaOpts = {
  appendPlugins: [DEFAULT_INFLECTOR]
}

const postgraphileStitchOpts = {
  merge: {
    User: {
      fieldName: 'user',
      selectionSet: '{ id }',
      args: originalObject => ({ id: originalObject.id })
    }
  }
}

const localStitchOpts = {
  merge: {
    User: {
      fieldName: 'localUser',
      selectionSet: '{ id }',
      args: originalObject => ({ id: originalObject.id })
    }
  }
}

module.exports = async function (fastify, options) {
  fastify.register(require('mercurius'), {
    resolvers,
    schema,
    graphiql: 'graphiql'
  })

  fastify.register(mercuriusPostGraphile, {
    connectionString,
    pgPool,
    postgraphileSchemaOpts,
    postgraphileStitchOpts,
    localStitchOpts
  })
}
