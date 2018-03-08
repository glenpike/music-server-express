import express from 'express';
import parseTracks from '../utils/parse-tracks';

const router = express.Router();

router.get('/', function(req, res, next) {
    req.collection.aggregate(
        [
            {
                $match: {
                    metadata: { $exists: true },
                    'metadata.genre': { $ne: null },
                },
            },
            { $project: { genre: '$metadata.genre' } },
            { $unwind: '$genre' },
            { $group: { _id: '$genre', num_tracks: { $sum: 1 } } },
            { $sort: { num_tracks: -1 } },
        ],
        function(e, results) {
            if (e) {
                req.log.error('Error listing genres: ', err);
                return next(e);
            }
            res.send(results);
        }
    );
});

router.get('/:id', function(req, res, next) {
    req.collection
        .find({ 'metadata.genre': req.params.id })
        .sort({
            'metadata.artist': 1,
            'metadata.album': 1,
            'metadata.disk.no': 1,
            'metadata.track.no': 1,
        })
        .toArray(function(e, results) {
            if (e) {
                req.log.error('Error getting genre: ', err);
                return next(e);
            }
            res.send(parseTracks(results));
        });
});

module.exports = router;
