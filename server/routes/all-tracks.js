import express from 'express';

const router = express.Router();

router.get('/', function(req, res, next) {
    console.log('all');
    req.collection.find({}).toArray(function(e, results) {
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

module.exports = router;
