import md5 from 'md5';
import pool from './';
import logger from '../utils/logger';
import errors from '../utils/errors';

const { status } = errors;

//Very simplistic CRUD wrapper for database

export const readTracks = (params, callback) => {
    // FIXME - querying currently disabled...
    // const query = params || {};
    pool
        .query('SELECT * FROM tracks')
        .then((results) => {
            if (!results.rows) {
                return callback({ error: status.TRACK_LIST_ERROR });
            }
            return callback(null, results.rows);
        })
        .catch((error) => {
            logger.error('readTracks, error:', error);
            return callback({ error: status.TRACK_LIST_ERROR });
        });
};

export const readTrack = (hash, callback) => {
    pool
        .query('SELECT * FROM tracks WHERE id = $1', [hash])
        .then((results) => callback(null, results))
        .catch((error) => {
            logger.error('readTrack, error:', error);
            return callback({ error: status.TRACK_READ_ERROR });
        });
};

export const createTrack = (file, callback) => {
    const hash = md5(file.path);
    logger.debug('createTrack...');
    readTrack(hash, (err, result) => {
        logger.debug('createTrack - readTrack ', result.rows, err);
        if (err) {
            return callback(err);
        }
        if (result.rows.length) {
            return callback(null, { error: status.TRACK_EXISTS });
        }
        const { ext, path, mime, metadata = null } = file;
        //Simple, fast, flat copy - assuming this never changes!
        const toInsert = [hash, ext, path, mime, metadata];

        const text =
            'INSERT INTO tracks(id, ext, path, mime, metadata) VALUES($1, $2, $3, $4, $5) RETURNING *';
        pool
            .query(text, toInsert)
            .then((results) => callback(null, results.rows[0]))
            .catch((error) => {
                logger.error('createTrack, error inserting track:', error);
                return callback({ error: status.TRACK_CREATE_ERROR });
            });
    });
};

export const updateMetadata = (file, metadata, callback) => {
    readTrack(file.id, (err, result) => {
        if (err) {
            return callback(err);
        }
        if (!result.rows.length) {
            logger.error('TRACK_NOT_FOUND');
            return callback(null, { error: status.TRACK_NOT_FOUND });
        }
        const track = result.rows[0];
        const text = 'UPDATE tracks SET metadata = $1 WHERE id = $2';
        pool
            .query(text, [metadata, file.id])
            .then(() => {
                track.metadata = metadata;
                return callback(null, track);
            })
            .catch((error) => {
                logger.error('updateMetadata, error updating track:', error);
                return callback({ error: status.TRACK_UPDATE_ERROR });
            });
    });
};

export const deleteTrack = (id, callback) => {
    logger.debug('deleteTrack...', id);
    readTrack(id, (err, result) => {
        if (err) {
            return callback(err);
        }
        if (!result.rows.length) {
            logger.error('TRACK_NOT_FOUND');
            return callback(null, { error: status.TRACK_NOT_FOUND });
        }
        const text = 'DELETE FROM tracks WHERE id = $1';
        pool
            .query(text, [id])
            .then((results) => {
                if (results.rowCount !== 1) {
                    logger.debug('deleteTrack nothing deleted ', results);
                    return callback({ error: status.TRACK_DELETE_ERROR });
                }
                return callback(null, true);
            })
            .catch((error) => {
                logger.error('deleteTrack, error:', error);
                return callback({ error: status.TRACK_DELETE_ERROR });
            });
    });
};

export const deleteAllTracks = (callback) => {
    const text = 'DELETE FROM tracks';
    pool
        .query(text)
        .then(() => {
            return callback(null, true);
        })
        .catch((error) => {
            logger.error('deleteAllTracks, error:', error);
            return callback({ error: status.TRACK_DELETE_ERROR });
        });
};
