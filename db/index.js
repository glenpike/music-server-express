import { Pool } from 'pg';
import config from '../config/env';

const pool = new Pool({
    connectionString: config.url,
});

export default pool;
