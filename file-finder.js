var fs = require('fs');
var path = require('path');

var readChunk = require('read-chunk');
var fileType = require('file-type');
var async = require('async');

function findFiles(dir, isAllowedFile, callback) {
    var results = [];
    //console.log('findFiles ', dir);
    fs.stat(dir, function(err, stat) {
        if (err) { return callback(err); }
        if (stat.isFile()) {
            var info = {
                    path: dir
                },
                extraInfo;

            if(isAllowedFile) {
                extraInfo = isAllowedFile(dir);
                if(extraInfo) {
                    info.ext = extraInfo.ext;
                    info.mime = extraInfo.mime;
                }
            }

            if(!isAllowedFile || extraInfo) {
                results.push(info);
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
                        console.log('a dir', dir, ' failed to process ', err);
                    } else {
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

function getSimpleExtFilter(accepted) {
    var acceptedFiles = null;
    if(accepted instanceof Array) {
        acceptedFiles = accepted.slice(0);
    } else if(accepted instanceof String) {
        acceptedFiles = accepted.split(',');
    }

    function fileExtFilter(file) {
        var buffer = readChunk.sync(file, 0, 262);
        var info = fileType(buffer);
        var result = null;

        if(info && (!acceptedFiles || !acceptedFiles.length || -1 != acceptedFiles.indexOf(info.ext))) {
            result = info;
        }
        return result;
    }

    return fileExtFilter;
}

module.exports = {
    findFiles: findFiles,
    getSimpleExtFilter: getSimpleExtFilter
};
