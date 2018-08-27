import md5 from 'md5';
import pool from './';
import logger from '../utils/logger';
import errors from '../utils/errors';

const { status } = errors;

//Very simplistic CRUD wrapper for database

// eslint-disable-next-line no-unused-vars
export const readTracks = async (params) => {
    // FIXME - querying currently disabled...
    // const query = params || {};
    try {
        const { rows: tracks } = await pool.query('SELECT * FROM tracks');
        logger.debug('readTracks ', tracks.length);
        return { tracks };
    } catch (error) {
        logger.error('readTracks, error:', error);
        return { error: status.TRACK_LIST_ERROR };
    }
};

export const readTrack = async (id) => {
    try {
        const { rows } = await pool.query('SELECT * FROM tracks WHERE id = $1', [id]);
        logger.debug('readTrack ', rows);
        const track = rows && rows[0] ? rows[0] : null;
        return { track };
    } catch (error) {
        logger.error('readTrack, error:', error);
        return { error: status.TRACK_READ_ERROR };
    }
};

export const createTrack = async (file) => {
    const id = md5(file.path);
    logger.debug('createTrack...');
    const { track, error } = await readTrack(id);
    logger.debug('createTrack - readTrack ', track, error);
    if (error) {
        return error;
    }
    if (track) {
        return { error: status.TRACK_EXISTS };
    }
    try {
        const { ext, path, mime, metadata = null } = file;
        //Simple, fast, flat copy - assuming this never changes!
        const toInsert = [id, ext, path, mime, metadata];

        const text =
            'INSERT INTO tracks(id, ext, path, mime, metadata) VALUES($1, $2, $3, $4, $5) RETURNING *';
        const { rows } = await pool.query(text, toInsert)
        return { track: rows[0] };
    } catch (error) {
        logger.error('createTrack, error inserting track:', error);
        return { error: status.TRACK_CREATE_ERROR };
    }
};

export const updateMetadata = async (id, metadata) => {
    logger.debug('updateMetadata...');
    const { track, error } = await readTrack(id);
    logger.debug('updateMetadata - readTrack ', track, error);
    if (error) {
        return error;
    }
    if (!track) {
        return { error: status.TRACK_NOT_FOUND };
    }
    try {
        const text = 'UPDATE tracks SET metadata = $1 WHERE id = $2';
        await pool.query(text, [metadata, id]);
        track.metadata = metadata;
        return { track };
    } catch (error) {
        logger.error('updateMetadata, error updating track:', error);
        return { error: status.TRACK_UPDATE_ERROR };
    }
};

export const deleteTrack = async (id) => {
    logger.debug('deleteTrack...');
    const { track, error } = await readTrack(id);
    logger.debug('deleteTrack - readTrack ', track, error);
    if (error) {
        return error;
    }
    if (!track) {
        return { error: status.TRACK_NOT_FOUND };
    }
    try {
        const text = 'DELETE FROM tracks WHERE id = $1';
        const { rowCount } = await pool.query(text, [id])
        if (rowCount !== 1) {
            logger.debug('deleteTrack nothing deleted ');
            return { error: status.TRACK_DELETE_ERROR };
        }
        return { deleted: 1 };
    } catch (error) {
        logger.error('deleteTrack, error:', error);
        return { error: status.TRACK_DELETE_ERROR };
    }
};

export const deleteAllTracks = async () => {
    try {
        const { rowCount } = await pool.query('DELETE FROM tracks')
        return { deleted: rowCount };
    } catch (error) {
        logger.error('deleteAllTracks, error:', error);
        return { error: status.TRACK_DELETE_ERROR };
    }
};
