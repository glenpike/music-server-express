import express from 'express';
import parseTracks from '../utils/parse-tracks';
import { collection } from '../../db';

const router = express.Router();

router.get('/', function(req, res, next) {
    collection.aggregate(
        [
            { $match: { metadata: { $exists: true } } },
            { $project: { artist: '$metadata.artist' } },
            { $unwind: '$artist' },
            { $group: { _id: '$artist', num_tracks: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ],
        function(e, results) {
            if (e) {
                req.log.error('Error listing artists: ', err);
                return next(e);
            }
            res.send(results);
        }
    );
});

router.get('/:id', function(req, res, next) {
    collection
        .find({ 'metadata.artist': req.params.id })
        .sort({
            'metadata.album': 1,
            'metadata.disk.no': 1,
            'metadata.track.no': 1,
        })
        .toArray(function(e, results) {
            if (e) {
                req.log.error('Error getting artist: ', err);
                return next(e);
            }
            res.send(parseTracks(results));
        });
});

module.exports = router;
