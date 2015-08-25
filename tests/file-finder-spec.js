var chai = require("chai");
chai.should();
chai.use(require('chai-things'));

var path = require('path');
var ff = require('../file-finder');

describe('file-finder tests', function() {

    var dir = __dirname;

    //Doesn't account for path separator!
    it('can return a list of files in a directory', function(done) {
        var fullPath = path.resolve('../node_modules/chai');
        ff.findFiles(fullPath, null, function(err, results) {
            [
                'package.json',
                'index.js',
                'lib/chai.js',
                'lib/chai/core/assertions.js'
            ].forEach(function(fileToCheck) {
                var pathToCheck = fullPath + '/' + fileToCheck;
                results.should.contain.an.item.with.property('path', pathToCheck);

            })

            done();
        });
    });

    it('can be passed a function to filter files ', function(done) {
        var count = 0;
        var filter = function(file) {
            count++;
            if(count % 2) {
                return {
                    count: count
                };
            } else {
                return null;
            }
        }

        var fullPath = path.resolve('../node_modules/chai');
        ff.findFiles(fullPath, filter, function(err, results) {
            results.length.should.equal(count / 2);
            results.should.all.have.property('count');
            done();
        });

    });

    function testGetSimpleFilter(extensions, expected, filter, done) {
        var fullPath = path.resolve('./test-files');
        ff.findFiles(fullPath, filter, function(err, results) {
            results.length.should.equal(extensions.length * expected.length);
            for(var i = 0;i < extensions.length;i++) {
                for(var j = 0;j < expected.length;j++) {
                    var pathToCheck = fullPath + '/' + expected[j] + '.' + extensions[i];
                    results.should.contain.an.item.with.property('path', pathToCheck);
                }
            }
            done();
        });
    }

    it('the simple filter works with an array ', function(done) {
        var extensions = ['jpg', 'wav'];
        var expected = [
            '1', 'dir1/a', 'dir1/dir2/b', 'dir1/dir2/dir3/c',
            'dir4/d', 'dir4/dir5/e', 'dir6/f'
        ];
        var filter = ff.getSimpleExtFilter(extensions);
        testGetSimpleFilter(extensions, expected, filter, done);

    });

    it('the simple filter works with a string ', function(done) {
        var extensions = ['png', 'flac'];
        var expected = [
            '1', 'dir1/a', 'dir1/dir2/b', 'dir1/dir2/dir3/c',
            'dir4/d', 'dir4/dir5/e', 'dir6/f'
        ];
        var filter = ff.getSimpleExtFilter(extensions.join(','));
        testGetSimpleFilter(extensions, expected, filter, done);
    });
})
