'use strict'

const fp = require('fastify-plugin')
const { createPostGraphileSchema, withPostGraphileContext } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')

async function mercuriusPostgraphile (fastify, opts) {
  const { graphql } = fastify
  const {
    connectionString,
    graphileSchemaOpts = {},
    graphileContextOpts = {},
    instanceName = 'public',
    mergeOpts,
    pgPool,
    transformsOpts
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
        transforms: transformsOpts,
        merge: mergeOpts
      },
      graphql.schema
    ]
  }))

  const getContextOpts = typeof graphileContextOpts === 'function' ? graphileContextOpts : () => graphileContextOpts

  const { jwtSecret, pgDefaultRole } = graphileSchemaOpts

  function wrappedExecutor (source, context, variables, operationName) {
    return withPostGraphileContext(
      {
        pgPool,
        jwtSecret,
        pgDefaultRole,
        ...getContextOpts(context)
      },
      (pgContext) => graphql(source, { ...context, ...pgContext }, variables, operationName)
    )
  }

  fastify.graphql = wrappedExecutor
}

module.exports = fp(mercuriusPostgraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
