import express from 'express';

const router = express.Router();

router.get('/', function(req, res, next) {
    req.collection.find({}).toArray(function(e, results) {
        if (e) {
            req.log.error('Error getting all tracks: ', err);
            return next(e);
        }
        res.send(results);
    });
});

module.exports = router;
