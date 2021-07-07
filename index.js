'use strict'

const fp = require('fastify-plugin')
const { print } = require('graphql')
const { createPostGraphileSchema } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')
const { delegateToSchema } = require('@graphql-tools/delegate')
const { makeQueryRunner } = require('./makeQueryRunner.js')

async function mercuriusPostgraphile (fastify, opts) {
  const { graphql } = fastify
  const {
    connectionString,
    graphileSchemaOpts = {},
    instanceName = 'public',
    mergeOpts = {},
    pgClient,
    transformsOpts,
  } = opts

  const postgraphileSchema = await createPostGraphileSchema(
    connectionString,
    instanceName,
    {
      subscriptions: true,
      dynamicJson: true,
      setofFunctionsContainNulls: false,
      ignoreRBAC: false,
      ignoreIndexes: false,
      legacyRelations: 'omit',
      ...graphileSchemaOpts
    }
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
    subschemas: [
      {
        schema: postgraphileSchema,
        createProxyingResolver: createProxyingResolverWithPGClient,
        executor: async ({ document, variables }) => {
          const runner = await makeQueryRunner(postgraphileSchema, pgClient)
          return runner(print(document), variables)
        },
        transforms: transformsOpts,
        merge: mergeOpts
      },
      graphql.schema
    ],
    mergeTypes: true
  }))
}

module.exports = fp(mercuriusPostgraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
