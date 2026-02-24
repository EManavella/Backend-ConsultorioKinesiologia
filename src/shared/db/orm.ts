import { MikroORM } from '@mikro-orm/core'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

const DB_HOST     = process.env.DB_HOST     || 'localhost'
const DB_PORT     = process.env.DB_PORT     || '3306'
const DB_USER     = process.env.DB_USER     || 'nibble'
const DB_PASSWORD = process.env.DB_PASSWORD || 'nibble'
const DB_NAME     = process.env.DB_NAME     || 'consultorio'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'], 
  entitiesTs: ['src/**/*.entity.ts'],

  dbName: DB_NAME,
  type: 'mysql',
  clientUrl: `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  await generator.updateSchema()
}