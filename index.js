'use strict'

const fp = require('fastify-plugin')
const { createPostGraphileSchema } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')
const { delegateToSchema } = require('@graphql-tools/delegate')

async function mercuriusPostgraphile (fastify, opts) {
  const { graphql } = fastify
  const {
    connectionString,
    pgClient,
    instanceName = 'public'
  } = opts

  const postgraphileSchema = await createPostGraphileSchema(
    connectionString,
    instanceName
  )

  function createProxyingResolverWithPGClient ({
    subschemaConfig,
    operation,
    transforms,
    transformedSchema
  }) {
    return (_parent, _args, context, info) => delegateToSchema({
      schema: subschemaConfig,
      operation,
      context: {
        ...context,
        pgClient
      },
      info,
      transformedSchema
    })
  }

  graphql.replaceSchema(stitchSchemas({
    // TODO(jkirkpatrick24): We need to allow the passing of schema stitching arguments.
    // Additionally we could leverage mercurius-remote-schema here to handle the stitching.
    subschemas: [
      {
        schema: postgraphileSchema,
        createProxyingResolver: createProxyingResolverWithPGClient
      },
      graphql.schema
    ]
  }))
}

module.exports = fp(mercuriusPostgraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
