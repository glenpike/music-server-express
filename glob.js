var glob = require('glob')

glob('/media/linmedia/Music/**/*.+(wav|mp3)', null, function(err, files) {
	console.log('files ', files, 'err ', err);
});
