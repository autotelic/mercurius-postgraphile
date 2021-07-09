# Mercurius PostGraphile

> A [Fastify](https://www.fastify.io/docs/latest/) plugin for integrating [PostGraphile]() schemas with [Mercurius]()

## Contents

- [Usage](#usage)
- [API](#api)(#mercuriusPostGraphile)
- [Run the Example](#run-the-example)
- [Resources](#resources)

## Usage

```sh
npm i @autotelic/mercurius-postgraphile
```

```js
const mercuriusPostGraphile = require('@autotelic/mercurius-postgraphile')
const { Pool } = require('pg')
const connectionString = process.env.DATABASE_URL
const pgPool = new Pool({ connectionString })

module.exports = async function (fastify, options) {
  fastify.register(mercuriusPostGraphile, {
    connectionString,
    pgPool
  })
}
```

## API

### `Options`

| Name | Status | Type | Default | Description |
| ------- | :---: | :---: | :---: | --- |
| `connectionString` | **Required** | String | - | A postgreSQL database connection string, i.e. `postgres://postgres:password@0.0.0.0:5432/postgres?sslmode=disable`. |
| `pgPool` | **Required** | Object | - | A client or pool instance that will be passed to the [pg](https://node-postgres.com/) library and used to connect to a PostgreSQL backend. |
| `instanceName` | Optional | String | `public` | A string which specifies the PostgreSQL schema that PostGraphile will use to create a GraphQL schema. |
| `localStitchOpts` | Optional | Object | `{}` | An object containing local subschema config options. |
| `postgraphileStitchOpts` | Optional | Object | `{}` | An object containing PostGraphile subschema config options. `stitchOpts` for both the local and PostGraphile schemas implement the `SubschemaConfig` interface. [Documention can be found here](https://www.graphql-tools.com/docs/stitch-combining-schemas#subschema-configs) |
| `postgraphileContextOpts` | Optional | Object/Function | `{}` | An object or callback function containing `withPostGraphileContext` options, outlined [here](https://www.graphile.org/postgraphile/usage-schema/#api-withpostgraphilecontextoptions-callback) |
| `postgraphileSchemaOpts` | Optional | Object | `{}` | An object containing `createPostGraphileSchema` options, outlined [here](https://www.graphile.org/postgraphile/usage-schema/#api-createpostgraphileschemapgconfig-schemaname-options) |

## Run the Example

#### Install Dependencies and Run a Local Postgres Container

```sh
npm i
docker-compose up -d
```

#### Run the server

```sh
npm run example
```

#### Make Requests to the Server

```sh
http localhost:3000/graphql
http post localhost:3000/graphql
```

#### Explore Graphiql

[http://localhost:3000/graphiql](http://localhost:3000/graphiql)

The `user` query from PostGraphile and the `localUser` query from Mercurius are used to merge the `User` type. Check out the [example](https://github.com/autotelic/mercurius-postgraphile/tree/main/example/index.js) to explore the stitch options implemented in merging the local and Postgraphile schemas.

```gql
query {
  user(id: 1) {
    username
    verified
  }
  localUser(id: 1) {
    username
    verified
  }
}
```

## Resources

- [Schema-Only PostGraphile](https://www.graphile.org/postgraphile/usage-schema/)
- [Schema Stitching](https://www.graphql-tools.com/docs/stitch-combining-schemas)
