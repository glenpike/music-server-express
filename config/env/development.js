/* global process */
export default {
    env: 'development',
    dbConnectionString: 'postgresql://music:express@localhost:5432/music',
    dbTable: 'tracks',
    port: process.env.PORT || 3000,
};
