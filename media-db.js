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
            return callback(null, false);
        }
        file._id = hash;
        collection.insert(file, {}, function(err, result) {
            if(err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}

function updateMediaItem(id, data, callback) {
    readMediaItem(id, function(err, result) {
        if(err) {
            console.log('updateMediaItem - readMediaItem error', err);
            return callback(err);
        }
        //console.log('updateMediaItem - readMediaItem result ', result);
        if(!result) {
            return callback(null, false);
        }
        collection.insert({_id: id}, {$set:data}, function(err, result) {
            if(err) {
                return callback(err);
            }
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
    updateMediaItem: updateMediaItem,
    deleteMediaItem: deleteMediaItem,
    deleteAllMediaItems: deleteAllMediaItems
};
