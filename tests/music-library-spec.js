var chai = require("chai");
chai.should();
expect = chai.expect;
chai.use(require('chai-things'));

var superagent = require('superagent'),
    agent = superagent.agent();

var serverURL = 'http://localhost:8081/library/';

var fs = require('fs');
var testData = JSON.parse(fs.readFileSync('./data/files.json')),
    testIds,
    uniqueAlbums = [],
    uniqueArtists = [],
    uniqueGenres = [];

var invalidId = 'no-such-thing';

function uniqueItems(src, target) {
    src.forEach(function(item) {
        if(-1 === target.indexOf(item)) {
            target.push(item);
        }
    });
}

//Map the expected data to various arrays to make it easier to test.
testIds = testData.map(function(item) {
    if(item.metadata) {
        var album = item.metadata.album;
        if(album && -1 === uniqueAlbums.indexOf(album)) {
            uniqueAlbums.push(album);
        }
        var genres = item.metadata.genre;
        if(genres && genres.length) {
            uniqueItems(genres, uniqueGenres);
        }
        var artists = item.metadata.artist;
        if(artists && artists.length) {
            uniqueItems(artists, uniqueArtists);
        }
    }
    return item._id
});

uniqueAlbums.sort();
uniqueArtists.sort();
uniqueGenres.sort();

describe('music-server library API tests', function() {

    it('retrieves a list of tracks', function(done) {
        agent.get(serverURL + 'tracks')
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(testData.length)
                res.body.forEach(function(track, index) {
                    expect(testIds).to.contain(track.id);
                })
                done()
            })
    });

    it('retrieves info for a single track', function(done) {
        //metadata for wav is not consistent
        var testTrack = testData.find(function(track) {
            return track.ext != 'wav';
        });
        agent.get(serverURL + 'tracks/' + testTrack._id)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body).to.deep.equal(testTrack);
                done()
            })
    });

    it('behaves correctly for getting an invalid track', function(done) {
        agent.get(serverURL + 'tracks/' + invalidId)
            .end(function(e, res) {
                expect(e).to.exist;
                expect(e.status).to.equal(404)
                expect(res.text).to.equal('Sorry! Can\'t find it.')
                done()
            })
    });

    it('retrieves a sorted list of albums', function(done) {
        agent.get(serverURL + 'albums')
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(uniqueAlbums.length)
                res.body.forEach(function(album, index) {
                    expect(uniqueAlbums[index]).to.equal(album._id);
                    expect(album.num_tracks).to.be.above(0);
                })
                done()
            })
    });

    it('retrieves track list for an album', function(done) {
        var album = uniqueAlbums[0],

            testAlbum = testData.filter(function(track) {
                if(!track.metadata) {
                    return false;
                }
                return track.metadata.album === album;
            });
            testAlbum.sort(function(a, b) {
                return a.metadata.track.no - b.metadata.track.no;
            });

        agent.get(serverURL + 'albums/' + album)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.deep.equal(testAlbum.length);
                res.body.forEach(function(track, index) {
                    expect(testAlbum[index]._id).to.equal(track.id);
                    expect(track.track).to.equal(index + 1);
                })
                done()
            })
    });

    it('behaves correctly for getting an invalid album', function(done) {
        agent.get(serverURL + 'albums/' + invalidId)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.body.length).to.equal(0)
                done()
            })
    });

    function testList(type, expected, done) {
        agent.get(serverURL + type)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(expected.length)
                res.body.forEach(function(item, index) {
                    expect(expected).to.contain(item._id);
                    expect(item.num_tracks).to.be.above(0);
                })
                done()
            })
    }

    function testInvalidItem(type, done) {
        agent.get(serverURL + type + '/' + invalidId)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.body.length).to.equal(0)
                done()
            })
    }

    it('retrieves a list of genres', function(done) {
        testList('genres', uniqueGenres, done);
    });

    it('retrieves track list for a genre', function(done) {
        var genre = uniqueGenres[0],

            testGenre = testData.filter(function(track) {
                if(!track.metadata) {
                    return false;
                }
                return track.metadata.genre[0] === genre;
            }).map(function(track) {
                return track._id;
            });

        agent.get(serverURL + 'genres/' + genre)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.deep.equal(testGenre.length);
                res.body.forEach(function(track, index) {
                    expect(testGenre).to.contain(track.id);
                    expect(track.title).to.exist;
                    expect(track.artist).to.exist;
                    expect(track.album).to.exist;
                    expect(track.path).to.exist;
                })
                done()
            })
    });

    it('behaves correctly for getting an invalid genre', function(done) {
        testInvalidItem('genres', done);
    });

    it('retrieves a sorted list of artists', function(done) {
        testList('artists', uniqueArtists, done);
    });

    it('retrieves track list for an artist', function(done) {
        var artist = 'Glen Pike',

            testArtist = testData.filter(function(track) {
                if(!track.metadata) {
                    return false;
                }
                return track.metadata.artist[0] === artist;
            }).map(function(track) {
                return track._id;
            });

        agent.get(serverURL + 'artists/' + artist)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.deep.equal(testArtist.length);
                res.body.forEach(function(track, index) {
                    expect(testArtist).to.contain(track.id);
                    expect(track.title).to.exist;
                    expect(track.artist).to.equal(artist);
                    expect(track.album).to.exist;
                    expect(track.path).to.exist;
                })
                done()
            })
    });

    it('behaves correctly for getting an invalid artist', function(done) {
        testInvalidItem('artists', done);
    });

    it('retrieves a list of all track data', function(done) {
        agent.get(serverURL + 'all')
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(testData.length)
                res.body.forEach(function(track, index) {
                    expect(testIds).to.contain(track._id);
                })
                done()
            })
    });

    function testValidTrackAction(type, ext, done) {
        var testTrack = testData.find(function(track) {
            return track.ext == ext;
        });
        var expectedMime = 'audio/mpeg';
        if('download' === type) {
            expectedMime = testTrack.mime;
        }

        var stat = fs.statSync(testTrack.path);
        agent.get(serverURL + type + '/' + testTrack._id)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.headers).to.include.keys('content-type')
                expect(res.headers['content-type']).to.equal(expectedMime)
                expect(res.headers).to.include.keys('content-length')
                expect(+res.headers['content-length']).to.equal(stat.size)

                done()
            })
    }

    it('can stream and transcode a single ogg track as mp3', function(done) {
        testValidTrackAction('play', 'ogg', done);
    });
    it('can stream and transcode a single wav track as mp3', function(done) {
        testValidTrackAction('play', 'wav', done);
    });
    it('can stream and transcode a single flac track as mp3', function(done) {
        testValidTrackAction('play', 'flac', done);
    });
    it('can stream a single mp3 track as mp3', function(done) {
        testValidTrackAction('play', 'mp3', done);
    });

    function testInvalidTrackAction(type, done) {
        agent.get(serverURL + type + '/' + invalidId)
            .end(function(e, res) {
                expect(e).to.exist;
                expect(e.status).to.equal(404)
                expect(res.text).to.equal('Sorry! Can\'t find it.')
                done()
            })
    }

    it('behaves correctly for playing an invalid track', function(done) {
        testInvalidTrackAction('play', done);
    });

    it('can download a single ogg track', function(done) {
        testValidTrackAction('download', 'ogg', done);
    });
    it('can download a single wav track', function(done) {
        testValidTrackAction('download', 'wav', done);
    });
    it('can download a single flac track', function(done) {
        testValidTrackAction('download', 'flac', done);
    });
    it('can download a single mp3 track', function(done) {
        testValidTrackAction('download', 'mp3', done);
    });

    it('behaves correctly for downloading an invalid track', function(done) {
        testInvalidTrackAction('download', done);
    });
});
