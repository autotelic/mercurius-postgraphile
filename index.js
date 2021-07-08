'use strict'

const fp = require('fastify-plugin')
const { execute } = require('graphql')
const { createPostGraphileSchema, withPostGraphileContext } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')

async function mercuriusPostgraphile (fastify, opts) {
  const {
    connectionString,
    instanceName = 'public',
    localStitchOpts = {},
    pgPool,
    postgraphileContextOpts = {},
    postgraphileSchemaOpts = {},
    postgraphileStitchOpts = {}
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
      ...postgraphileSchemaOpts
    }
  )

  const getContextOpts = typeof graphileContextOpts === 'function' ? postgraphileContextOpts : () => postgraphileContextOpts

  const { jwtSecret, pgDefaultRole } = postgraphileSchemaOpts

  async function postgraphileExecutor ({
    document,
    variables,
    context,
    rootValue,
    operationName
  }) {
    return await withPostGraphileContext({
      pgPool,
      jwtSecret,
      pgDefaultRole,
      ...getContextOpts(context)
    }, async (pgContext) => {
      return await execute(
        postgraphileSchema,
        document,
        rootValue,
        { ...context, ...pgContext },
        variables,
        operationName
      )
    })
  }

  fastify.graphql.replaceSchema(stitchSchemas({
    subschemas: [
      {
        schema: postgraphileSchema,
        executor: postgraphileExecutor,
        ...postgraphileStitchOpts
      },
      {
        schema: fastify.graphql.schema,
        ...localStitchOpts
      }
    ]
  }))
}

module.exports = fp(mercuriusPostgraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
