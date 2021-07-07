const { graphql } = require('graphql')
const { withPostGraphileContext } = require('postgraphile')

async function makeQueryRunner (schema, pgPool) {
  const query = async (graphqlQuery, variables = {}) => {
    return await withPostGraphileContext({ pgPool }, async (context) => {
      return await graphql(
        schema,
        graphqlQuery,
        null,
        { ...context },
        variables
      )
    }
    )
  }

  // Should we need to release this query runner, the cleanup tasks:
  const release = () => {
    pgPool.end()
  }

  return {
    query,
    release
  }
}

exports.makeQueryRunner = makeQueryRunner
