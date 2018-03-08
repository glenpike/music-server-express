import fs from 'fs';
import path from 'path';

import readChunk from 'read-chunk';
import fileType from 'file-type';
import async from 'async';
import logger from './logger';

const findFiles = (dir, isAllowedFile, callback) => {
    let results = [];

    fs.stat(dir, (err, stat) => {
        if (err) {
            return callback(err);
        }
        if (stat.isFile()) {
            const info = {};
            let extraInfo;

            if (isAllowedFile) {
                extraInfo = isAllowedFile(dir);
                //Should possibly look at "deep" extend here?
                if (extraInfo) {
                    for (const k in extraInfo) {
                        info[k] = extraInfo[k];
                    }
                }
            }

            info.path = dir;

            if (!isAllowedFile || extraInfo) {
                results.push(info);
            }
            return callback(null, results);
        } else if (stat.isDirectory()) {
            fs.readdir(dir, (err, files) => {
                async.eachSeries(
                    files,
                    (file, callback) => {
                        findFiles(
                            path.resolve(dir, file),
                            isAllowedFile,
                            function(err, res) {
                                results = results.concat(res);
                                return callback(null, results);
                            }
                        );
                    },
                    (err) => {
                        if (err) {
                            logger.error(
                                `a dir ${dir} failed to process: ${err}`
                            );
                        } else {
                            return callback(null, results);
                        }
                    }
                );
            });
        } else {
            logger.warn('strange file? ', stat);
            return;
        }
    });
};

export const getSimpleExtFilter = (accepted) => {
    let acceptedFiles = null;
    if (accepted instanceof Array) {
        acceptedFiles = accepted.slice(0);
    } else if (typeof accepted === 'string') {
        acceptedFiles = accepted.split(',');
    }

    return (file) => {
        const buffer = readChunk.sync(file, 0, 262);
        const info = fileType(buffer);
        let result = null;

        if (
            info &&
            (!acceptedFiles ||
                !acceptedFiles.length ||
                -1 != acceptedFiles.indexOf(info.ext))
        ) {
            result = info;
        }
        return result;
    };
};

export default findFiles;
