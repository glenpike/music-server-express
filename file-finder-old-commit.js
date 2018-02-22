//Find all files in a directory tree

//1.    List them out.

//2.    Filter the list by certain types - (add a test hook / function)
var fs = require('fs');
var path = require('path');
var readChunk = require('read-chunk');
var fileType = require('file-type');

var mm = require('musicmetadata');
var async = require('async');

var q = async.queue(function(task, callback) {
    console.log('q ', q.length(), ' num processing ', q.running(), ' file ', task.file);
    try {
        readMetaData(task.file, callback);
    } catch(e) {
        console.error('error: ', e.stack);
    }
}, 50);

q.pause();

var findFiles = function(dir, test, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    findFiles(file, test, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else if(stat && stat.isFile()) {
                    if(!test) {
                        results.push(file);
                    } else {
                        var info = test(file);
                        if(info) {
                            var fileInfo  = {file: file, info: info };
                            results.push(fileInfo);
                            q.push({file: file}, function(err, metadata) {
                                if(err) {
                                    console.log(file, ' error with readMetaData ', err);
                                }
                                else if(metadata) {
                                    console.log(' file done ', file, ' q ', q.running());
                                    fileInfo.meta = metadata
                                }
                            });
                        }
                    }
                    if (!--pending) done(null, results);
                }
            });
        });
    });
}


function test(file, done) {
    var buffer = readChunk.sync(file, 0, 262);
    var info = fileType(buffer);
    var result = null;
    var accepted = ['wmv','mpg','mp3','m4a','ogg','flac','wav'];

    if(info && -1 != accepted.indexOf(info.ext)) {
        result = info;
    }
    return result;
}

function readMetaData(file, done) {
    var parser = mm(fs.createReadStream(file), function (err, metadata) {
        if (err) {
            return done(err, null);
        }
        return done(null, metadata);
    });
}


findFiles('/media/ski/linmedia/Music/ogg/', test, function(err, results) {
    if(err) {
        throw err;
    }
    q.drain = function() {
        console.log('all items have been processed');

        console.log('results ', results);
    }
    q.resume();
    console.log('done list. ', q.length(), ' left in queue');
});
