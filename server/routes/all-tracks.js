import express from 'express';
import { collection } from '../../db';

const router = express.Router();

router.get('/', function(req, res, next) {
    collection.find({}).toArray(function(e, results) {
        if (e) {
            req.log.error('Error getting all tracks: ', err);
            return next(e);
        }
        res.send(results);
    });
});

module.exports = router;
