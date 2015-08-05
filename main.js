var ff = require('./file-finder.js');

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

try {
    var dir = process.argv.length > 2 ? process.argv[2] : '/media/ski/linmedia/Music/ogg/';
    var acceptedFiles = ['wmv','mpg','mp3','m4a','ogg','flac','wav'];
    var simpleExtFilter = ff.getSimpleExtFilter(acceptedFiles);

    ff.findFiles(dir, simpleExtFilter, function(err, results) {
        if(err) {
            throw err;
        }
        console.log('results ', results);
    });
} catch(e) {
    console.error(e.stack);
}
