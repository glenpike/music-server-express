import chai from 'chai';
import chaiThings from 'chai-things';
import should from 'should';
import path from 'path';
import findFiles, { getSimpleExtFilter } from '../utils/file-finder';

chai.should();
chai.use(chaiThings);

describe('file-finder tests', function() {
    const dir = __dirname;

    //Doesn't account for path separator!
    it('can return a list of files in a directory', function(done) {
        const fullPath = path.resolve(__dirname, '../node_modules/chai');
        findFiles(fullPath, null, function(err, results) {
            [
                'package.json',
                'index.js',
                'lib/chai.js',
                'lib/chai/core/assertions.js',
            ].forEach(function(fileToCheck) {
                const pathToCheck = fullPath + '/' + fileToCheck;
                results.should.contain.an.item.with.property(
                    'path',
                    pathToCheck
                );
            });

            done();
        });
    });

    //Also tests copying of "filter" output back into our file results
    it('can be passed a function to filter files ', function(done) {
        let count = 0;
        const filter = function(file) {
            count++;
            if (count % 2) {
                return {
                    count: count,
                };
            } else {
                return null;
            }
        };

        const fullPath = path.resolve(__dirname, '../node_modules/chai');
        findFiles(fullPath, filter, function(err, results) {
            results.length.should.equal(Math.ceil(count / 2));
            results.should.all.have.property('count');
            done();
        });
    });

    function testGetSimpleFilter(extensions, expected, filter, done) {
        const allTypes = ['jpg', 'png', 'wav', 'mp3', 'ogg', 'flac'];
        const fullPath = path.resolve(__dirname, './test-files');
        findFiles(fullPath, filter, function(err, results) {
            results.length.should.equal(extensions.length * expected.length);
            for (let i = 0; i < allTypes.length; i++) {
                for (let j = 0; j < expected.length; j++) {
                    const pathToCheck =
                        fullPath + '/' + expected[j] + '.' + allTypes[i];
                    if (-1 != extensions.indexOf(allTypes[i])) {
                        results.should.contain.an.item.with.property(
                            'path',
                            pathToCheck
                        );
                    } else {
                        results.should.not.contain.an.item.with.property(
                            'path',
                            pathToCheck
                        );
                    }
                }
            }
            done();
        });
    }

    it('the simple filter works with an array ', function(done) {
        const extensions = ['jpg', 'wav'];
        const expected = [
            '1',
            'dir1/a',
            'dir1/dir2/b',
            'dir1/dir2/dir3/c',
            'dir4/d',
            'dir4/dir5/e',
            'dir6/f',
        ];
        const filter = getSimpleExtFilter(extensions);
        testGetSimpleFilter(extensions, expected, filter, done);
    });

    it('the simple filter works with a string ', function(done) {
        const extensions = ['png', 'flac'];
        const expected = [
            '1',
            'dir1/a',
            'dir1/dir2/b',
            'dir1/dir2/dir3/c',
            'dir4/d',
            'dir4/dir5/e',
            'dir6/f',
        ];
        const filter = getSimpleExtFilter(extensions.join(','));
        testGetSimpleFilter(extensions, expected, filter, done);
    });
});
