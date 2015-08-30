var fs = require('fs');
var ff = require('./file-finder.js');
var Promise = require("es6-promise").Promise;
var mediaDb = require('./media-db.js');
var async = require('async');
var mm = require('musicmetadata');

function cleanDB() {
    return new Promise(function(resolve, reject) {
        mediaDb.deleteAllMediaItems(function(err, results) {
            console.log('deleteAllMediaItems ', arguments);
            if(err) {
                reject(err);
            }
            resolve(results);
        });
    });
}

function findFiles(path) {
    var acceptedFiles = ['wmv','mpg','mp3','m4a','ogg','flac','wav'];
    var simpleExtFilter = ff.getSimpleExtFilter(acceptedFiles);

    return new Promise(function(resolve, reject) {
        ff.findFiles(dir, simpleExtFilter, function(err, results) {
            if(err) {
                reject(err);
            }
            resolve(results);
        });
    });
}


function addFilesToDB(files) {
    return new Promise(function(resolve, reject) {
        try {
            var errors = [];
            var added = [];

            //Create a queue 'worker' function which processes each item
            //we add to the queue
            function fileWorker(task, callback) {
                mediaDb.createMediaItem(task.file, function(err, wasAdded) {
                    if(err) {
                        errors.push({
                            file: task.file.path,
                            error: err
                        });
                    } else if(wasAdded) {
                        added.push(task.file);
                    }
                    callback(err);
                });
            }

            var q = async.queue(fileWorker, 10);

            q.pause();

            for(var i = 0;i < files.length;i++) {
                q.push({file: files[i]});
            }

            q.drain = function() {
                resolve({files: files, errors: errors, added: added});
            };

            q.resume();
        } catch(e) {
            //overkill?  We may have DB errors!
            reject(e);
        }
    });
}

function updateMediaInfo(files) {
    return new Promise(function(resolve, reject) {
        try {
            var errors = [];
            var filesWithMetadata = 0;
            var filesUpdated = []

            //TODO - still "smell" around the whole errors / callback thing.
            function getDataAndUpdate(task, taskCallback) {
                async.waterfall([
                    function(callback) {
                        mm(fs.createReadStream(task.file.path), function (err, metadata) {
                            if(err) {
                                errors.push({
                                    file: task.file.path,
                                    error: err
                                });
                                callback(err);
                            } else if(metadata) {
                                filesWithMetadata++;
                                callback(null, task.file, metadata);
                            }

                        });
                    },
                    function(file, metadata, callback) {
                        mediaDb.updateMetadata(file, metadata, function(err, wasUpdated) {
                            if(err) {
                                errors.push({
                                    file: task.file.path,
                                    error: err
                                });
                                callback(err);
                            } else if(wasUpdated) {
                                filesUpdated.push(task.file);
                                callback(null, task.file);
                            }

                        });
                    }

                ], function(err, result) {
                    //console.log('waterfall main ', err, result);
                    taskCallback(err)
                });
            }

            var q = async.queue(getDataAndUpdate, 10);

            q.pause();

            for(var i = 0;i < files.length;i++) {
                q.push({file: files[i]});
            }

            q.drain = function() {
                resolve({
                    files: files,
                    errors: errors,
                    filesWithMetadata: filesWithMetadata,
                    filesUpdated:filesUpdated
                });
            };

            q.resume();
        } catch(e) {
            reject(e);
        }
    });
}

try {
    var dir = process.argv.length > 2 ? process.argv[2] : '/media/ski/linmedia/Music/ogg/';
    cleanDB().then(function() {
        return findFiles(dir);
    }).then(function(files) {
        return addFilesToDB(files);
    }).then(function(results) {
        console.log('added ', results.added.length, 'of ', results.files.length, ' errors ', results.errors);
        //Now, for each added file, read it's meta-data and update the DB...
        return updateMediaInfo(results.added);
    }).then(function(results) {
        console.log('db updated meta in ', results.filesUpdated.length, 'of ', results.filesWithMetadata, ' errors ', results.errors);
        //console.log('filesWithMetadata ', results.filesWithMetadata);
        // console.log('filesUpdated ', results.filesUpdated);
        process.exit();
    }).catch(function(error) {
        console.log('error ', error);
        process.exit();
    });
} catch(e) {
    console.error('eek ', e.stack);
}
