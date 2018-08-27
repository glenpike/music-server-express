/* global module */
import express from 'express';
import {
    readTracks,
    readTrack,
    createTrack,
    updateMetadata,
    deleteTrack,
} from '../../db/track';
import errors from '../../utils/errors';
import logger from '../../utils/logger';

const { status, errorMessages } = errors;

const router = express.Router();

router.get('/', async (req, res, next) => {
    const { tracks, error } = await readTracks(null);
    if (error) {
        return next(errorMessages(error));
    }
    const entries = [];
    tracks.forEach(function(track) {
        const data = {
            id: track.id,
            path: track.path ? track.path : 'No path',
        };
        if (track.metadata && track.metadata.title) {
            data.title = track.metadata.title;
        } else {
            data.title = data.path.replace(/.*\/([^.]+)\..*$/gi, '$1');
        }
        if (track.metadata && track.metadata.album) {
            data.album = track.metadata.album;
        }
        entries.push(data);
    });
    res.send(entries);
});

router.get('/:id', async (req, res, next) => {
    const { track, error } = await readTrack(req.params.id);
    logger.debug('readTrack result ', track, error);
    if (error) {
        return next(errorMessages(error));
    }
    if (!track) {
        res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
    } else {
        res.send(track);
    }
});

router.post('/', async (req, res, next) => {
    const { path, ext, mime, metadata = {} } = req.body;
    logger.debug('POST track ', req.body);
    if (!path || !ext || !mime) {
        res.status(400).send({
            status: 'error',
            message: 'missing required field - path | ext | mime',
        });
        return;
    }
    const { track, error } = await createTrack({ path, ext, mime, metadata });
    if (error) {
        if(error === status.TRACK_EXISTS) {
            res.status(409).send(errorMessages(status.TRACK_EXISTS));
            return next();
        }
        return next(errorMessages(error));
    }
    logger.debug('createTrack result ', track);
    res.status(201).send(track);
});

router.patch('/:id', async (req, res, next) => {
    const { metadata } = req.body;

    const { track, error } = await updateMetadata(req.params.id, metadata);
    logger.debug('updateMetadata result ', track, error);
    if (error) {
        if(error === status.TRACK_NOT_FOUND) {
            res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
            return next();
        }
        return next(errorMessages(error));
    }
    res.status(200).send(track);
});

router.delete('/:id', async (req, res, next) => {
    const { error } = await deleteTrack(req.params.id);
    if (error) {
        if(error === status.TRACK_NOT_FOUND) {
            res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
            return next();
        }
        res.status(500).send(errorMessages(status.TRACK_DELETE_ERROR));
        return next();
    }
    return res.status(204).send();
});

module.exports = router;
