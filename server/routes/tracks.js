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

router.get('/', (req, res, next) => {
    readTracks(null, function(err, results) {
        if (err) {
            return next(errorMessages(err));
        }
        const entries = [];
        results.forEach(function(entry) {
            const data = {
                id: entry.id,
                path: entry.path ? entry.path : 'No path',
            };
            if (entry.metadata && entry.metadata.title) {
                data.title = entry.metadata.title;
            } else {
                data.title = data.path.replace(/.*\/([^.]+)\..*$/gi, '$1');
            }
            if (entry.metadata && entry.metadata.album) {
                data.album = entry.metadata.album;
            }
            entries.push(data);
        });
        res.send(entries);
    });
});

router.get('/:id', (req, res, next) => {
    readTrack(req.params.id, function(err, result) {
        if (err) {
            return next(errorMessages(err));
        }
        if (!result) {
            res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
        } else {
            res.send(result);
        }
    });
});

router.post('/', (req, res, next) => {
    const { path, ext, mime, metadata = {} } = req.body;
    logger.debug('POST tracks ', req.body);
    if (!path || !ext || !mime) {
        res.status(400).send({
            status: 'error',
            message: 'missing required field - path | ext | mime',
        });
    } else {
        createTrack({ path, ext, mime, metadata }, (err, result) => {
            if (err) {
                return next(errorMessages(err));
            }
            logger.debug('createTrack result ', result);
            if (result.error && result.error === status.TRACK_EXISTS) {
                res.status(409).send(errorMessages(status.TRACK_EXISTS));
                return next();
            }
            res.status(201).send(result);
        });
    }
});

router.patch('/:id', (req, res, next) => {
    const { metadata } = req.body;

    updateMetadata({ _id: req.params.id }, metadata, (err, result) => {
        if (err) {
            return next(errorMessages(err));
        }
        if (result.error && result.error === status.TRACK_NOT_FOUND) {
            res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
            return next();
        }
        res.status(200).send(result);
    });
});

router.delete('/:id', (req, res, next) => {
    return deleteTrack(req.params.id, (err, result) => {
        if (err) {
            res.status(500).send(errorMessages(status.TRACK_DELETE_ERROR));
            next();
        }
        if (result.error && result.error === status.TRACK_NOT_FOUND) {
            res.status(404).send(errorMessages(status.TRACK_NOT_FOUND));
            return next();
        }
        return res.status(204).send();
    });
});

module.exports = router;
