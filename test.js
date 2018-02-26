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

    // findFiles(path, simpleExtFilter, (err, results) => {
    //     if (err) {
    //         console.log('err ', err);
    //     }
    //     console.log('results ', results);
    // });
    return promisify(findFiles)(path, simpleExtFilter);
};

findAudioFiles('/media/linmedia/Music/tmp').then((files) => {
    console.log('results ', files);
});
