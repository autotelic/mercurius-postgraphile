# Mercurius PostGraphile

> A [Fastify](https://www.fastify.io/docs/latest/) plugin for integrating [PostGraphile](https://www.graphile.org/postgraphile/) schemas with [Mercurius](https://mercurius.dev/)

## Contents

- [Usage](#usage)
- [API](#api)
- [Example](#example)

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
| `postGraphileStitchOpts` | Optional | Object | `{}` | An object containing PostGraphile subschema config options. `stitchOpts` for both the local and PostGraphile schemas implement the `SubschemaConfig` interface. [Documention can be found here](https://www.graphql-tools.com/docs/stitch-combining-schemas#subschema-configs) |
| `postGraphileContextOpts` | Optional | Object/Function | `{}` | An object or callback function containing `withPostGraphileContext` options, outlined [here](https://www.graphile.org/postgraphile/usage-schema/#api-withpostgraphilecontextoptions-callback) |
| `postGraphileSchemaOpts` | Optional | Object | `{}` | An object containing `createPostGraphileSchema` options, outlined [here](https://www.graphile.org/postgraphile/usage-schema/#api-createpostgraphileschemapgconfig-schemaname-options) |

## Example

```sh
npm i
docker-compose up -d
npm run test
```
