/* global process */
export default {
    env: 'test',
    url: 'postgresql://music:express@localhost:5432/music',
    collection: 'files',
    port: process.env.PORT || 3000,
};
