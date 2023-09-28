import { DB } from './types'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import 'dotenv/config'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 10,
    ssl: {
      rejectUnauthorized: true,
    }
  })
})

export const db = new Kysely<DB>({
  dialect,
})
