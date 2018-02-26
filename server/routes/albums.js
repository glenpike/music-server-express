import express from 'express';
import parseTracks from '../utils/parse-tracks';

const router = express.Router();

router.get('/', function(req, res, next) {
    console.log('albums');
    req.collection.aggregate(
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
                return next(e);
            }
            res.send(results);
        }
    );
});

router.get('/:id', function(req, res, next) {
    console.log('album');
    req.collection
        .find({ 'metadata.album': req.params.id })
        .sort({ 'metadata.disk.no': 1, 'metadata.track.no': 1 })
        .toArray(function(e, results) {
            if (e) {
                return next(e);
            }
            res.send(parseTracks(results));
        });
});

module.exports = router;
