'use strict'

const { graphql } = require('graphql')
const { withPostGraphileContext } = require('postgraphile')

async function makeQueryRunner (opts) {
  const {
    schema,
    pgClient,
    graphileContextOpts,
    graphileSchemaOpts
  } = opts

  const getContextOpts = typeof graphileContextOpts === 'function' ? graphileContextOpts : () => graphileContextOpts

  const { jwtSecret, pgDefaultRole } = graphileSchemaOpts

  return async (graphqlQuery, variables = {}) => (
    withPostGraphileContext({
      pgClient,
      jwtSecret,
      pgDefaultRole,
      ...getContextOpts(context)
    }, async (context) => (
      graphql(
        schema,
        graphqlQuery,
        null,
        { ...context },
        variables
      )
    ))
  )
}

module.exports = { makeQueryRunner }
