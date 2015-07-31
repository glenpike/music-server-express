//Find all files in a directory tree

//1.    List them out.

//2.    Filter the list by certain types - (add a test hook / function)
var fs = require('fs');
var path = require('path');
var readChunk = require('read-chunk');
var fileType = require('file-type');

// var mm = require('musicmetadata');
var async = require('async');

var findFiles = function(dir, isAllowedFile, callback) {
    var results = [];
    //console.log('findFiles ', dir);
    fs.stat(dir, function(err, stat) {
        if (err) { return callback(err); }
        if (stat.isFile()) {
            if(!isAllowedFile || isAllowedFile(dir)) {
                results.push(dir);
            }
            return callback(null, results);
        } else if(stat.isDirectory()) {
            fs.readdir(dir, function(err, files) {
                async.eachSeries(files, function(file, callback) {
                    //console.log('processing file ', file)
                    findFiles(path.resolve(dir, file), isAllowedFile, function(err, res) {
                         results = results.concat(res);
                         return callback(null, results);
                    });
                }, function(err) {
                    if(err) {
                        console.log('a dir failed to process ', err);
                    } else {
                        //console.log('dir processed successfully ', dir);
                        return callback(null, results);
                    }
                });
            });
        } else {
            console.warn('strange file? ', stat);
            return;
        }
    });
}

// function readMetaData(file, done) {
//     var parser = mm(fs.createReadStream(file), function (err, metadata) {
//         if (err) {
//             return done(err, null);
//         }
//         return done(null, metadata);
//     });
// }

// var q = async.queue(function(task, callback) {
//     console.log('q ', q.length(), ' num processing ', q.running(), ' file ', task.file);
//     try {
//         readMetaData(task.file, callback);
//     } catch(e) {
//         console.error('error: ', e.stack);
//     }
// }, 50);

// q.pause();

function isAllowedFile(file, done) {
    var buffer = readChunk.sync(file, 0, 262);
    var info = fileType(buffer);
    var result = null;
    var accepted = ['wmv','mpg','mp3','m4a','ogg','flac','wav'];

    if(info && -1 != accepted.indexOf(info.ext)) {
        result = info;
    }
    return result;
}



try {
    var dir = process.argv.length > 2 ? process.argv[2] : '/media/ski/linmedia/Music/ogg/';

    findFiles(dir, isAllowedFile, function(err, results) {
        if(err) {
            throw err;
        }
        console.log('results ', results);
        // q.drain = function() {
        //     console.log('all items have been processed');

        //     console.log('results ', results);
        // }
        // q.resume();
        // console.log('done list. ', q.length(), ' left in queue');
    });
} catch(e) {
    console.error(e.stack);
}
