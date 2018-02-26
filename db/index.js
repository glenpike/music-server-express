import mongoskin from 'mongoskin';
import config from '../config/env';

const db = mongoskin.db(config.url, { safe: true });
export const collection = db.collection(config.collection);

export default db;
