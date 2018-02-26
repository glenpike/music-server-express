import express from 'express';
import parseTracks from '../utils/parse-tracks';

const router = express.Router();

router.get('/', function(req, res, next) {
    console.log('artists');
    req.collection.aggregate(
        [
            { $match: { metadata: { $exists: true } } },
            { $project: { artist: '$metadata.artist' } },
            { $unwind: '$artist' },
            { $group: { _id: '$artist', num_tracks: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ],
        function(e, results) {
            if (e) {
                return next(e);
            }
            res.send(results);
        }
    );
});

router.get('/:id', function(req, res, next) {
    console.log('artist');
    req.collection
        .find({ 'metadata.artist': req.params.id })
        .sort({
            'metadata.album': 1,
            'metadata.disk.no': 1,
            'metadata.track.no': 1,
        })
        .toArray(function(e, results) {
            if (e) {
                return next(e);
            }
            res.send(parseTracks(results));
        });
});

module.exports = router;
