var fs = require('fs');
var commandLineArgs = require('command-line-args');
var ff = require('./file-finder.js');
var Promise = require("bluebird");
var mediaDb = require('./media-db.js');
var mm = require('musicmetadata');

//TODO - make the media-file meta-parsers pluggable so that each one
//will register the file-types it supports with the acceptedFiles
//array in findFiles and then the correct one gets called at
//getDataAndUpdate time

function cleanDB() {
    return Promise.promisify(mediaDb.deleteAllMediaItems)();
}

function findFiles(path) {
    var acceptedFiles = ['wmv','mpg','mp3','m4a','ogg','flac','wav'];
    var simpleExtFilter = ff.getSimpleExtFilter(acceptedFiles);

    return Promise.promisify(ff.findFiles)(path, simpleExtFilter);
}

function addFilesToDB(files) {
    var errors = [],
        queued = [], parallel = 10;

    var createMediaItem = Promise.promisify(mediaDb.createMediaItem);

    //http://spion.github.io/promise-nuggets/16-map-limit.html
    var mediaItemPromises = files.map(function(file) {

        var limit = Math.max(0, queued.length - parallel + 1);

        var mediaItem = Promise.some(queued, limit)
            .then(function() {
                //will return an existing or newly created item
                return createMediaItem(file);
            })
            .catch(function(err) {
                errors.push({
                    file: task.file.path,
                    error: err
                });
            });

        queued.push(mediaItem);

        return mediaItem;
    });
    return Promise.all(mediaItemPromises).then(function(files) {
        debug('addFilesToDB complete ', files);
        return {files: files, errors: errors, added: files }
    });
    //We don't catch anything here - allow to bubble up - need tests?
}
function updateMediaInfo(files) {

    var errors = [];
    var filesWithMetadata = 0;
    var filesUpdated = [];

    var updateMetadata = Promise.promisify(mediaDb.updateMetadata);
    var mmAsync = Promise.promisify(mm);

    var queued = [], parallel = 10;

    //Duplication - can factor generic queue into function
    var updateItemPromises = files.map(function(file) {

        var limit = Math.max(0, queued.length - parallel + 1);

        var updateItem = Promise.some(queued, limit)
            .then(function() {
                return mmAsync(fs.createReadStream(file.path))
                .then(function(metadata) {
                    filesWithMetadata++;
                    return updateMetadata(file, metadata);
                })
                .then(function(wasUpdated) {
                    if(wasUpdated) {
                        filesUpdated.push(file);
                    }
                    return file;
                })
                .catch(function(err) {
                    var error = {
                        file: file.path,
                        error: err
                    }
                    errors.push(error);
                    debug('updateItem error ', error);
                });
            });

        queued.push(updateItem);
        return updateItem;
    });
    return Promise.all(updateItemPromises).then(function(files) {
        debug('updateMediaInfo complete ');
        return {
            files: files,
            errors: errors,
            filesWithMetadata: filesWithMetadata,
            filesUpdated:filesUpdated
        }
    });
}

var cli = commandLineArgs([
    { name: "help", alias: "h", type: Boolean, description: 'Display this usage guide'},
    { name: "verbose", alias: "v", type: Boolean, description: 'Lots of output'},
    { name: "path", alias: 'p', type: String, defaultOption: true, description: 'A file system path to search for files' },//, multiple: true },
    { name: "clean", alias: "c", type: Boolean, description: 'If set, will clean the database first.' },
    { name: "test", alias: "t", type: Boolean, description: 'Use the test configuration'}
]);
var options = cli.parse();

if(options.help) {
    var usage = cli.getUsage({
        title: "media-file-finder",
        description: "Command line function to find music files in a directory tree " +
            "\n  and add them to a database along with any metadata read from the file.",
        footer: "Project home: [underline]{https://github.com/me/my-app}"
    });

    console.log(usage);
    process.exit();
}
function debug() {
    if(options.verbose) {
        console.log.apply(this, arguments);
    }
}

function configureDB() {
    var dbConf;

    if(options.test) {
        dbConf = require('./config/test-database');
    } else {
        dbConf = require('./config/database');
    }
    mediaDb.configure(dbConf);
}

function start() {
    configureDB();
    //TODO - cross reference albums and other metadata.
    //TODO - what happens when files are deleted on disk?
    //'/media/linmedia/Music/ogg/'
    var path = './tests/test-files';

    var dir = options.path ? options.path : path;

    //We only clean the DB if set, otherwise we resolve a "dummy" promise
    ((options.clean) ? cleanDB() : Promise.resolve(options))
    .then(function() {
        return findFiles(dir);
    })
    .then(function(files) {
        return addFilesToDB(files);
    }).then(function(results) {
        debug('added ', results.added.length, 'of ', results.files.length, ' errors ', results.errors);
        //Now, for each added file, read it's meta-data and update the DB...
        return updateMediaInfo(results.added);
    }).then(function(results) {
        debug('db updated meta in ', results.filesUpdated.length, 'of ', results.filesWithMetadata, ' errors ', results.errors);
        //console.log('filesWithMetadata ', results.filesWithMetadata);
        // console.log('filesUpdated ', results.filesUpdated);
        process.exit();
    }).catch(function(error) {
        debug('error ', error);
        process.exit();
    });
}

start();
