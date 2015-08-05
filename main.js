var ff = require('./file-finder.js');
var Promise = require("es6-promise").Promise;
var mediaDb = require('./media-db.js');

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

function addFilesToDB(files, callback) {
    var errors = [];
    var added = [];
    var done = 0;

    //Queue this!!!
    for(var i = 0;i < files.length;i++) {
        mediaDb.addFile(files[i], function(err, wasAdded) {
            if(err) {
                errors.push({
                    file: files[i].path,
                    error: err
                });
            } else if(wasAdded) {
                added.push(files[i]);
            }
            done++;
            if(done == files.length) {
                callback(errors, added)
            }
        });
    }
}

try {
    var dir = process.argv.length > 2 ? process.argv[2] : '/media/ski/linmedia/Music/ogg/';
    findFiles(dir).then(function(files) {
        addFilesToDB(files, function(errors, added) {
            console.log('added ', added.length, 'of ', files.length, ' errors ', errors);
        });
    }, function(error) {
        console.log('error finding files ', error);
    });
} catch(e) {
    console.error('eek ', e.stack);
}
