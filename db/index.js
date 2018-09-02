import { Pool } from 'pg';
import config from '../config/env';

export const dbTable = config.dbTable;

const pool = new Pool({
    connectionString: config.dbConnectionString,
});

export default pool;
