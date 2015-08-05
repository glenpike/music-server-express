var mongoskin = require('mongoskin');
var dbConf = require('./config/database');
var md5 = require('md5');
var db = mongoskin.db(dbConf.url, {safe:true});
var collection = db.collection('files');


function getFile(hash, callback) {
    collection.findOne({_id: hash}, function(err, result) {
        if(err) {
            return callback(err);
        }
        return callback(null, result);
    })
}
function addFile(file, callback) {
    var hash = md5(file.path);
    getFile(hash, function(err, result) {
        if(err) {
            console.log('addFile - getFile error', err);
            return callback(err);
        }
        //console.log('addFile - getFile result ', result);
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
module.exports = {
    addFile: addFile
};
