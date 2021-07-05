'use strict'

const fp = require('fastify-plugin')
const { createPostGraphileSchema, withPostGraphileContext } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')
const { delegateToSchema } = require('@graphql-tools/delegate')
const DEFAULT_INFLECTOR = require('@graphile-contrib/pg-simplify-inflector')

async function mercuriusPostgraphile (fastify, opts) {
  const { graphql } = fastify
  const {
    connectionString,
    pgClient,
    instanceName = 'public',
    transformsOpts,
    mergeOpts
  } = opts


  const defaultSettings = {
    subscriptions: true,
    watchPg: true,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    ignoreIndexes: false,
    appendPlugins: [DEFAULT_INFLECTOR],
    enableQueryBatching: true,
    legacyRelations: 'omit'
  }

  const postgraphileSchema = await createPostGraphileSchema(
    connectionString,
    instanceName,
    defaultSettings
  )

  function createProxyingResolverWithPGClient ({
    subschemaConfig,
    operation,
    transforms,
    transformedSchema
  }) {
    return (_parent, _args, context, info) => withPostGraphileContext(
    {
      pgPool: pgClient,
      // jwtToken: jwtToken,
      // jwtSecret: "...",
      // pgDefaultRole: "..."
    }, (pgContext) =>
      delegateToSchema({
      schema: subschemaConfig,
      operation,
      context: {...context, ...pgContext},
      info,
      transformedSchema
    }))
  }

  graphql.replaceSchema(stitchSchemas({
    subschemas: [
      {
        schema: postgraphileSchema,
        createProxyingResolver: createProxyingResolverWithPGClient,
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
