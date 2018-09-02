/* global process */
export default {
    env: 'test',
    dbConnectionString: 'postgresql://music:express@localhost:5432/music',
    dbTable: 'tracks_test',
    port: process.env.PORT || 3000,
};
