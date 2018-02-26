import { createReadStream } from 'fs';
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Promise = require('bluebird');
import mm from 'musicmetadata';

import findFiles, { getSimpleExtFilter } from './utils/file-finder.js';
import { createTrack, deleteAllTracks, updateMetadata } from './db/track';

const promisify = Promise.promisify;

//TODO - make the media-file meta-parsers pluggable so that each one
//will register the file-types it supports with the acceptedFiles
//array in findFiles and then the correct one gets called at
//getDataAndUpdate time

const cleanDB = () => {
    return promisify(deleteAllTracks)();
};

const findAudioFiles = (path) => {
    const acceptedFiles = ['wmv', 'mpg', 'mp3', 'm4a', 'ogg', 'flac', 'wav'];
    const simpleExtFilter = getSimpleExtFilter(acceptedFiles);

    return promisify(findFiles)(path, simpleExtFilter);
};

const addFilesToDB = (files) => {
    const errors = [];
    const queued = [];
    const parallel = 10;

    //http://spion.github.io/promise-nuggets/16-map-limit.html
    const trackItemPromises = files.map((file) => {
        const limit = Math.max(0, queued.length - parallel + 1);

        const trackItem = Promise.some(queued, limit)
            .then(() => {
                //will return an existing or newly created item
                return promisify(createTrack)(file);
            })
            .catch((err) => {
                errors.push({
                    file: task.file.path,
                    error: err,
                });
            });

        queued.push(trackItem);

        return trackItem;
    });
    return Promise.all(trackItemPromises).then((files) => {
        logger('addFilesToDB complete ', files);
        return { files: files, errors: errors, added: files };
    });
    //We don't catch anything here - allow to bubble up - need tests?
};

const updateTrackInfo = (files) => {
    const errors = [];
    let filesWithMetadata = 0;
    const filesUpdated = [];

    const queued = [];
    const parallel = 10;

    //Duplication - can factor generic queue into function
    const updateItemPromises = files.map((file) => {
        const limit = Math.max(0, queued.length - parallel + 1);

        const updateItem = Promise.some(queued, limit).then(() => {
            return promisify(mm)(createReadStream(file.path))
                .then((metadata) => {
                    filesWithMetadata++;
                    return promisify(updateMetadata)(file, metadata);
                })
                .then((wasUpdated) => {
                    if (wasUpdated) {
                        filesUpdated.push(file);
                    }
                    return file;
                })
                .catch((err) => {
                    const error = {
                        file: file.path,
                        error: err,
                    };
                    errors.push(error);
                    logger('updateItem error ', error);
                });
        });

        queued.push(updateItem);
        return updateItem;
    });
    return Promise.all(updateItemPromises).then((files) => {
        logger('updateTrackInfo complete ');
        return {
            files: files,
            errors: errors,
            filesWithMetadata: filesWithMetadata,
            filesUpdated: filesUpdated,
        };
    });
};

const options = commandLineArgs([
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide',
    },
    {
        name: 'verbose',
        alias: 'v',
        type: Boolean,
        description: 'Lots of output',
    },
    {
        name: 'path',
        alias: 'p',
        type: String,
        defaultOption: true,
        description: 'A file system path to search for files',
    }, //, multiple: true },
    {
        name: 'clean',
        alias: 'c',
        type: Boolean,
        description: 'If set, will clean the database first.',
    },
]);

if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'media-file-finder',
            content: `Command line function to find music files in a directory tree
and add them to a database along with any metadata read from the file.`,
        },
        {
            header:
                '[underline]{https://github.com/glenpike/music-server-express}',
        },
    ]);

    console.log(usage);
    process.exit();
}

const logger = (...rest) => {
    if (options.verbose) {
        console.log.apply(this, rest);
    }
};

const start = () => {
    //TODO - cross reference albums and other metadata.
    //TODO - what happens when files are deleted on disk?
    //'/media/linmedia/Music/ogg/'
    const path = './tests/test-files';

    const dir = options.path ? options.path : path;

    //We only clean the DB if set, otherwise we resolve a "dummy" promise
    (options.clean ? cleanDB() : Promise.resolve(options))
        .then(() => {
            return findAudioFiles(dir);
        })
        .then((files) => {
            return addFilesToDB(files);
        })
        .then((results) => {
            logger(
                'added ',
                results.added.length,
                'of ',
                results.files.length,
                ' errors ',
                results.errors
            );
            //Now, for each added file, read it's meta-data and update the DB...
            return updateTrackInfo(results.added);
        })
        .then((results) => {
            logger(
                'db updated meta in ',
                results.filesUpdated.length,
                'of ',
                results.filesWithMetadata,
                ' errors ',
                results.errors
            );
            //console.log('filesWithMetadata ', results.filesWithMetadata);
            // console.log('filesUpdated ', results.filesUpdated);
            process.exit();
        })
        .catch((error) => {
            logger('error ', error);
            process.exit();
        });
};

start();
