export default {
    env: 'development',
    url: 'mongodb://@localhost:27017/media-store',
    collection: 'files',
    port: process.env.PORT || 3000,
};
