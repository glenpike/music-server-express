var express = require('express');
var mongoskin = require('mongoskin');
var dbConf = require('./config/database');

var db = mongoskin.db(dbConf.url, {safe:true});
//var collection = db.collection('files');

var library = express.Router();

library.use('/', function(req, res, next) {
    req.collection = db.collection('files');
    return next();
});


library.get('/', function(req, res, next) {
    console.log('library');
    var entries = [];
    req.collection.find({}, {_id: 1, path: 1, metadata: 1})
        .toArray(function(e, results) {
            if(e) {
                return next(e)
            }
            results.forEach(function(entry) {
                var data = {
                    id: entry._id,
                    path: entry.path ? entry.path : 'No path'
                };
                if(entry.metadata && entry.metadata.title) {
                    data.title = entry.metadata.title;
                } else {
                    data.title = data.path.replace(/.*\/([^.]+)\..*$/gi, '$1');
                }
                if(entry.metadata.album) {
                    data.album = entry.metadata.album;
                }
                entries.push(data);

            });
            res.send(entries);
        })
});

library.get('/all', function(req, res, next) {
    console.log('all');
   req.collection.find({})
        .toArray(function(e, results) {
            if(e) {
                return next(e)
            }
            res.send(results);
        })
});

library.get('/albums', function(req, res, next) {
    console.log('albums');
    var albums = [];
    req.collection.aggregate([
        { $match: { metadata: { $exists: true } } },
        { $project: { album: "$metadata.album" } },
        {   $group : {_id : "$album", num_tracks: { $sum: 1 } } }
    ],
    function(e, results) {
        if(e) {
            return next(e)
        }
        res.send(results);
    // do something with err and result
    })
    // .toArray(function(e, results) {
    //         if(e) {
    //             return next(e)
    //         }
    //         res.send(results);
    //     })
});

module.exports = library;
