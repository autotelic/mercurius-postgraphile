'use strict'

const fp = require('fastify-plugin')
const { print } = require('graphql')
const { createPostGraphileSchema } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')
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
  graphql.replaceSchema(stitchSchemas({
    subschemas: [
      {
        schema: postgraphileSchema,
        executor: async ({ document, variables }) => {
          const runner = await makeQueryRunner(postgraphileSchema, pgClient)
          return runner(print(document), variables)
        },
        transforms: transformsOpts,
        merge: mergeOpts
      },
      graphql.schema
    ]
  }))
}

module.exports = fp(mercuriusPostgraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
