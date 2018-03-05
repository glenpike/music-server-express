import express from 'express';
import parseTracks from '../utils/parse-tracks';
import { createTrack, updateMetadata } from '../../db/track';

const router = express.Router();

router.get('/', (req, res, next) => {
    const entries = [];
    req.collection
        .find({}, { _id: 1, path: 1, metadata: 1 })
        .toArray(function(err, results) {
            if (err) {
                return next(err);
            }
            results.forEach(function(entry) {
                const data = {
                    id: entry._id,
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
    console.log('get ');
    req.collection.findOne({ _id: req.params.id }, function(err, result) {
        if (err) {
            console.log('error ', err);
            return next(e);
        }
        if (!result) {
            res.status(404).send("Sorry! Can't find it.");
        } else {
            console.log('get: ', result);
            res.send(result);
        }
    });
});

router.post('/', (req, res, next) => {
    const { path, ext, mime, metadata = {} } = req.body;
    if (!path || !ext || !mime) {
        res.status(400).send({
            status: 'error',
            message: 'missing required field - path | ext | mime',
        });
    } else {
        createTrack({ path, ext, mime, metadata }, (err, result) => {
            if (err) {
                console.log('error ', err);
                return next(err);
            }
            console.log('createTrack result ', result);
            // TODO: tidy / constant error statuses, etc.
            if (result.error && result.error === 'track exists') {
                res.status(409).send({
                    status: 'error',
                    message: 'track exists',
                });
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
            console.log('error ', err);
            return next(err);
        }
        if (result.error && result.error === `track doesn't exist`) {
            res.status(404).send({
                status: 'error',
                message: result.error,
            });
            return next();
        }
        res.status(200).send(result);
    });
});

router.delete('/:id', (req, res, next) => {
    req.collection.remove({ _id: req.params.id }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                status: 'error',
                message: 'unknown error',
            });
            next(err);
        }
        return res.status(204).send();
    });
});

module.exports = router;
