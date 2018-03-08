import mongoskin from 'mongoskin';
import md5 from 'md5';
import { collection } from './';
import logger from '../utils/logger';

//Very simplistic CRUD wrapper for database
//Does not take advantage of mongo / mongoskin features much.

export const readTracks = (params, callback) => {
    const query = params || {};
    collection.find(query, (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result.toArray());
    });
};

export const readTrack = (hash, callback) => {
    collection.findOne({ _id: hash }, (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};

export const createTrack = (file, callback) => {
    const hash = md5(file.path);
    logger.debug('createTrack...');
    readTrack(hash, (err, result) => {
        if (err) {
            logger.error('createTrack, error reading track:', err);
            return callback(err);
        }
        if (result) {
            return callback(null, { error: 'track exists' });
        }
        const { ext, path, mime, metadata = {} } = file;
        //Simple, fast, flat copy - assuming this never changes!
        const toInsert = {
            _id: hash,
            ext,
            path,
            mime,
            metadata,
        };

        collection.insert(toInsert, {}, (err, result) => {
            if (err) {
                logger.error('createTrack, error inserting track:', err);
                return callback(err);
            }

            //we should care more about the result in case something happened!
            return callback(null, toInsert);
        });
    });
};

export const updateMetadata = (file, metadata, callback) => {
    readTrack(file._id, (err, result) => {
        if (err) {
            logger.error('updateMetadata, error reading track:', err);
            return callback(err);
        }
        if (!result) {
            return callback(null, { error: `track doesn't exist` });
        }
        const track = result;
        collection.update(
            { _id: file._id },
            { $set: { metadata: metadata } },
            (err, result) => {
                if (err) {
                    logger.error('updateMetadata, error updating track:', err);
                    return callback(err);
                }
                track.metadata = metadata;
                return callback(null, track);
            }
        );
    });
};

export const deleteTrack = (file, callback) => {
    //is this a hash or an id?
    const hash = md5(file.path);
    collection.remove({ _id: hash }, (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, true);
    });
};

export const deleteAllTracks = (callback) => {
    collection.remove({}, (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, true);
    });
};
