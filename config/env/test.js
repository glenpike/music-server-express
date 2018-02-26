export default {
    env: 'test',
    url: 'mongodb://@localhost:27017/media-store-test',
    collection: 'files',
    port: process.env.PORT || 3000,
};
