'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const mercurius = require('mercurius')
const { Pool } = require('pg')

const plugin = require('.')

const schema = `
  type Query {
    add(x: Int, y: Int): Result
  }

  type Result {
    result: Int
  }
`

const resolvers = {
  Query: {
    add: async (_, { x, y }) => ({ result: x + y })
  }
}

test('Stitches postgraphile and local subschemas', async (t) => {
  const service = Fastify()

  const connectionString = 'postgres://postgres:postgres@0.0.0.0:5432/postgres?sslmode=disable'

  t.teardown(async () => {
    await pgPool.end()
    await service.close()
  })

  service.inject.query = async (query) => {
    const res = await service.inject({
      method: 'POST',
      url: '/graphql',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    return res.json()
  }

  service.register(mercurius, {
    schema,
    resolvers
  })

  const pgPool = new Pool({ connectionString })

  service.register(plugin, {
    connectionString,
    pgClient: pgPool
  })

  await service.ready()

  const actual = await service.inject.query(`{
    add(x: 1, y: 3) {
      result
    }
    allUsers(first: 10) {
      edges {
        node {
          username
          id
        }
      }
    }
  }`)

  const expected = {
    data: {
      add: { result: 4 },
      allUsers: {
        edges: [
          {
            node: {
              username: 'test-user',
              id: 1
            }
          }
        ]
      }
    }
  }

  t.same(actual, expected)
})
