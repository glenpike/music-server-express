var express = require('express');
var mongoskin = require('mongoskin');

var db, collectionName;

var library = express.Router();

library.configure = function(dbConf) {
    db = mongoskin.db(dbConf.url, {safe:true});
    collectionName = dbConf.collection;
}

library.use('/', function(req, res, next) {
    req.collection = db.collection(collectionName);
    return next();
});


library.get('/tracks', function(req, res, next) {
    console.log('tracks');
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
                if(entry.metadata && entry.metadata.album) {
                    data.album = entry.metadata.album;
                }
                entries.push(data);

            });
            res.send(entries);
        })
});
library.get('/tracks/:id', function(req, res, next) {
    console.log('get ');
    req.collection.findOne({ _id: req.params.id },
        function(e, result) {
            if(e) {
                console.log('error ', e)
                return next(e)
            }
            if(!result) {
                res.status(404).send('Sorry! Can\'t find it.');
            } else {
                console.log('get: ', result)
                res.send(result);
            }
        })
});

//FIXME - investigate settings, etc.
function transcode(file) {
    var spawn = require('child_process').spawn

    var decode = spawn('flac', [
        '--decode',
        '--stdout',
        file
    ])

    var encode = spawn('lame', [
        '-V0',
        '-',
        '-'
    ])

    decode.stdout.pipe(encode.stdin)

    return encode
}

library.get('/play/:id', function(req, res, next) {
    console.log('stream');
    req.collection.findOne({ _id: req.params.id },
        function(e, result) {
            if(e) {
                console.log('error ', e)
                return next(e)
            }
            if(!result) {
                res.status(404).send('Sorry! Can\'t find it.');
            } else {
                console.log('play file ', result);
                var fs = require('fs')
                stat = fs.statSync(result.path);
                res.writeHead(200, {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': stat.size
                });
                var readStream;
                if(-1 === result.mime.indexOf('mpeg')) {
                    console.log('not an mpeg file, will transcode ', result);

                    readStream = transcode(result.path).stdout;
                } else {
                    readStream = fs.createReadStream(result.path);
                }
                readStream.pipe(res);
                readStream.on('end', function() {
                    console.log('readStream end');
                });
            }
        })
});

library.get('/download/:id', function(req, res, next) {
    console.log('play');
    req.collection.findOne({ _id: req.params.id },
        function(e, result) {
            if(e) {
                console.log('error ', e)
                return next(e)
            }
            if(!result) {
                res.status(404).send('Sorry! Can\'t find it.');
            } else {
                var fs = require('fs')
                stat = fs.statSync(result.path);
                var options = {
                    headers: {
                        'Content-Type': result.mime,
                        'Content-Length': stat.size
                    }
                };

                res.sendFile(result.path, options, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else {
                        console.log('Sent:', result.path);
                    }
                });

            }
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

function parseTracks(results) {
    var tracks = [];

    results.forEach(function(track) {
        var data = {
            id: track._id,
            path: track.path ? track.path : 'No path'
        };
        if(track.metadata) {
            if(track.metadata.artist) {
                data.artist = track.metadata.artist.join(',');
            }
            if(track.metadata.album) {
                data.album = track.metadata.album;
            }
            if(track.metadata.title) {
                data.title = track.metadata.title;
            } else {
                data.title = data.path.replace(/.*\/([^.]+)\..*$/gi, '$1');
            }
            if(track.metadata.track && track.metadata.track.no) {
                data.track = track.metadata.track.no;
            }
            if(track.metadata.disk && track.metadata.disk.no) {
                data.disk = track.metadata.disk.no;
            }
        }

        tracks.push(data);
    });
    return tracks;
}

library.get('/albums', function(req, res, next) {
    console.log('albums');
    req.collection.aggregate([
        { $match: { metadata: { $exists: true }, 'metadata.album': { $ne: ""} } },
        { $project: { album: "$metadata.album" } },
        {   $group : {_id : "$album", num_tracks: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ],
    function(e, results) {
        if(e) {
            return next(e)
        }
        res.send(results);
    });
});

library.get('/albums/:id', function(req, res, next) {
    console.log('album');
    req.collection.find({ 'metadata.album': req.params.id})
        .sort({ 'metadata.disk.no': 1, 'metadata.track.no': 1})
        .toArray(function(e, results) {
            if(e) {
                return next(e)
            }
            res.send(parseTracks(results));
        });
});

library.get('/artists', function(req, res, next) {
    console.log('artists');
    req.collection.aggregate([
        { $match: { metadata: { $exists: true } } },
        { $project: { artist: "$metadata.artist" } },
        { $unwind : "$artist" },
        {   $group : {_id : "$artist", num_tracks: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ],
    function(e, results) {
        if(e) {
            return next(e)
        }
        res.send(results);
    });
});

library.get('/artists/:id', function(req, res, next) {
    console.log('artist');
    req.collection.find({ 'metadata.artist': req.params.id})
        .sort({ 'metadata.album': 1, 'metadata.disk.no': 1, 'metadata.track.no': 1})
        .toArray(function(e, results) {
            if(e) {
                return next(e)
            }
            res.send(parseTracks(results));
        });
});

library.get('/genres', function(req, res, next) {
    console.log('genres');
    req.collection.aggregate([
        { $match: { metadata: { $exists: true }, 'metadata.genre': { $ne: null} } },
        { $project: { genre: "$metadata.genre" } },
        { $unwind : "$genre" },
        { $group : {_id : "$genre", num_tracks: { $sum: 1 } } },
        { $sort: { "num_tracks": -1 } }
    ],
    function(e, results) {
        if(e) {
            return next(e)
        }
        res.send(results);
    });
});

library.get('/genres/:id', function(req, res, next) {
    console.log('genre');
    req.collection.find({ 'metadata.genre': req.params.id})
        .sort({ 'metadata.artist': 1, 'metadata.album': 1, 'metadata.disk.no': 1, 'metadata.track.no': 1})
        .toArray(function(e, results) {
            if(e) {
                return next(e)
            }
            res.send(parseTracks(results));
        });
});

module.exports = library;
