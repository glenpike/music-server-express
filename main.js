var ff = require('./file-finder.js');
var Promise = require("es6-promise").Promise;
var mediaDb = require('./media-db.js');
var async = require('async');

// function readMetaData(file, done) {
//     var parser = mm(fs.createReadStream(file), function (err, metadata) {
//         if (err) {
//             return done(err, null);
//         }
//         return done(null, metadata);
//     });
// }
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

try {
    var dir = process.argv.length > 2 ? process.argv[2] : '/media/ski/linmedia/Music/ogg/';
    cleanDB().then(function() {
        return findFiles(dir);
    }).then(function(files) {
        return addFilesToDB(files);
    }).then(function(results) {
        console.log('added ', results.added.length, 'of ', results.files.length, ' errors ', results.errors);
        //Now, for each added file, read it's meta-data and update the DB...

        process.exit();
    }).catch(function(error) {
        console.log('error ', error);
        process.exit();
    });
} catch(e) {
    console.error('eek ', e.stack);
}
