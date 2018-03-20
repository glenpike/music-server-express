import express from 'express';
import parseTracks from '../utils/parse-tracks';
import { collection } from '../../db';

const router = express.Router();

router.get('/', function(req, res, next) {
    collection.aggregate(
        [
            {
                $match: {
                    metadata: { $exists: true },
                    'metadata.album': { $ne: '' },
                },
            },
            { $project: { album: '$metadata.album' } },
            { $group: { _id: '$album', num_tracks: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ],
        function(e, results) {
            if (e) {
                req.log.error('Error listing albums: ', err);
                return next(e);
            }
            res.send(results);
        }
    );
});

router.get('/:id', function(req, res, next) {
    collection
        .find({ 'metadata.album': req.params.id })
        .sort({ 'metadata.disk.no': 1, 'metadata.track.no': 1 })
        .toArray(function(e, results) {
            if (e) {
                req.log.error('Error getting album: ', err);
                return next(e);
            }
            res.send(parseTracks(results));
        });
});

module.exports = router;
