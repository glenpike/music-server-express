import mongoskin from 'mongoskin';
import md5 from 'md5';
import { collection } from './';
import logger from '../utils/logger';
import errors from '../utils/errors';

const { status } = errors;

//Very simplistic CRUD wrapper for database
//Does not take advantage of mongo / mongoskin features much.

export const readTracks = (params, callback) => {
    const query = params || {};
    collection
        .find(query, { _id: 1, path: 1, metadata: 1 })
        .toArray((err, results) => {
            if (err) {
                logger.error('readTracks, error:', err);
                return callback({ error: status.TRACK_LIST_ERROR });
            }
            return callback(null, results);
        });
};

export const readTrack = (hash, callback) => {
    collection.findOne({ _id: hash }, (err, result) => {
        if (err) {
            logger.error('readTrack, error:', err);
            return callback({ error: status.TRACK_READ_ERROR });
        }
        return callback(null, result);
    });
};

export const createTrack = (file, callback) => {
    const hash = md5(file.path);
    logger.debug('createTrack...');
    readTrack(hash, (err, result) => {
        if (err) {
            return callback(err);
        }
        if (result) {
            return callback(null, { error: status.TRACK_EXISTS });
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
                return callback({ error: status.TRACK_CREATE_ERROR });
            }

            //we should care more about the result in case something happened!
            return callback(null, toInsert);
        });
    });
};

export const updateMetadata = (file, metadata, callback) => {
    readTrack(file._id, (err, result) => {
        if (err) {
            return callback(err);
        }
        if (!result) {
            logger.error('TRACK_NOT_FOUND');
            return callback(null, { error: status.TRACK_NOT_FOUND });
        }
        const track = result;
        collection.update(
            { _id: file._id },
            { $set: { metadata: metadata } },
            (err, result) => {
                if (err) {
                    logger.error('updateMetadata, error updating track:', err);
                    return callback({ error: status.TRACK_UPDATE_ERROR });
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
            logger.error('deleteTrack, error:', err);
            return callback({ error: status.TRACK_DELETE_ERROR });
        }
        return callback(null, true);
    });
};

export const deleteAllTracks = (callback) => {
    collection.remove({}, (err, result) => {
        if (err) {
            logger.error('deleteAllTracks, error:', err);
            return callback({ error: status.TRACK_DELETE_ERROR });
        }
        return callback(null, true);
    });
};
