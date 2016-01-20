var mongoskin = require('mongoskin');
var dbConf = require('./config/database');
var md5 = require('md5');
var db = mongoskin.db(dbConf.url, {safe:true});
var collection = db.collection('files');

//Very simplistic CRUD wrapper for database
//Does not take advantage of mongo / mongoskin features much.
function readMediaItems(params, callback) {
    var query = params || {};
    collection.find(query, function(err, result) {
        if(err) {
            return callback(err);
        }
        return callback(null, result.toArray());
    })
}

function readMediaItem(hash, callback) {
    collection.findOne({_id: hash}, function(err, result) {
        if(err) {
            return callback(err);
        }
        return callback(null, result);
    })
}

function createMediaItem(file, callback) {
    var hash = md5(file.path);

    readMediaItem(hash, function(err, result) {
        if(err) {
            console.log('createMediaItem - readMediaItem error', err);
            return callback(err);
        }
        //console.log('createMediaItem - readMediaItem result ', result);
        if(result) {
            return callback(null, result);
        }
        //Simple, fast, flat copy - assuming this never changes!
        var toInsert = {
            _id:hash,
            ext: file.ext,
            path: file.path,
            mime: file.mime
        };

        collection.insert(toInsert, {}, function(err, result) {
            if(err) {
                return callback(err);
            }

            //we should care more about the result in case something happened!
            //console.log('insert result ', result);
            return callback(null, toInsert);
        });
    });
}

function updateMetadata(file, metadata, callback) {
    readMediaItem(file._id, function(err, result) {
        if(err) {
            console.log('updateMetadata - readMediaItem error', err);
            return callback(err);
        }
        //console.log('updateMetadata - ', file.path, ' metadata ', metadata);
        if(!result) {
            return callback(null, false);
        }
        collection.update({_id: file._id}, {$set: {metadata:metadata}}, function(err, result) {
            if(err) {
                return callback(err);
            }
            file.metadata = metadata;
            return callback(null, true);
        });
    });
}

function deleteMediaItem(file, callback) {
    //is this a hash or an id?
    var hash = md5(file.path);
    collection.remove({_id: hash}, function(err, result) {
        if(err) {
            return callback(err);
        }
        return callback(null, true);
    });
}

function deleteAllMediaItems(callback) {
    collection.remove({}, function(err, result) {
        if(err) {
            return callback(err);
        }
        return callback(null, true);
    });
}
module.exports = {
    createMediaItem: createMediaItem,
    readMediaItem: readMediaItem,
    readMediaItems: readMediaItems,
    updateMetadata: updateMetadata,
    deleteMediaItem: deleteMediaItem,
    deleteAllMediaItems: deleteAllMediaItems
};
