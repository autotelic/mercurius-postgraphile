'use strict'

const { graphql } = require('graphql')
const { withPostGraphileContext } = require('postgraphile')

async function makeQueryRunner (schema, pgPool) {
  return async (graphqlQuery, variables = {}) => {
    return await withPostGraphileContext({ pgPool }, async (context) => {
      return await graphql(
        schema,
        graphqlQuery,
        null,
        { ...context },
        variables
      )
    })
  }
}

module.exports = { makeQueryRunner }
