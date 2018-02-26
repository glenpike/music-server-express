import express from 'express';
import parseTracks from '../utils/parse-tracks';

const router = express.Router();

router.get('/', function(req, res, next) {
    const entries = [];
    req.collection
        .find({}, { _id: 1, path: 1, metadata: 1 })
        .toArray(function(e, results) {
            if (e) {
                return next(e);
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

router.get('/:id', function(req, res, next) {
    console.log('get ');
    req.collection.findOne({ _id: req.params.id }, function(e, result) {
        if (e) {
            console.log('error ', e);
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

module.exports = router;
