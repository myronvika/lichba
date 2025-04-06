import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'
const sql = neon('postgresql://neondb_owner:npg_gne0MKkyP6Qo@ep-soft-star-a5ay7mhp-pooler.us-east-2.aws.neon.tech/Expenses-Tracker?sslmode=require');
export const db = drizzle(sql,{schema});