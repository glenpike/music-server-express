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
    albums = [],
    artists = [],
    genres = [];

var invalidId = 'no-such-thing';

//Map the expected data to various arrays to make it easier to test.
testIds = testData.map(function(item) {
    if(item.metadata) {
        var album = item.metadata.album;
        if(album && -1 === albums.indexOf(album)) {
            albums.push(album);
        }
        // Fixme - only one genre
        var genre = item.metadata.genre;
        if(genre && genre.length) {
            genre.forEach(function(g) {
                if(-1 === genres.indexOf(g)) {
                    genres.push(g);
                }
            });
        }
        var artist = item.metadata.artist;
        if(artist && artist.length) {
            artist.forEach(function(a) {
                if(-1 === artists.indexOf(a)) {
                    artists.push(a);
                }
            });
        }
    }
    return item._id
});

albums.sort();
artists.sort();
genres.sort();

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
        //metadata for wav is not consistently there
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
                expect(res.body.length).to.equal(albums.length)
                res.body.forEach(function(album, index) {
                    expect(albums[index]).to.equal(album._id);
                    expect(album.num_tracks).to.be.above(0);
                })
                done()
            })
    });

    it('retrieves track list for an album', function(done) {
        var album = albums[0],

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

    it('retrieves a list of genres', function(done) {
        agent.get(serverURL + 'genres')
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(genres.length)
                var totalTracks = 0;
                res.body.forEach(function(genre, index) {
                    expect(genres).to.contain(genre._id);
                    expect(genre.num_tracks).to.be.above(0);
                    //totalTracks += genre.num_tracks;
                })
                //Doesn't work because wav's have no meta-data.
                //expect(totalTracks).to.equal(testData.length)
                done()
            })
    });

    it('retrieves track list for a genre', function(done) {
        var genre = genres[0],

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
        agent.get(serverURL + 'genres/' + invalidId)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.body.length).to.equal(0)
                done()
            })
    });

    it('retrieves a sorted list of artists', function(done) {
        agent.get(serverURL + 'artists')
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.body.length).to.equal(artists.length)
                res.body.forEach(function(artist, index) {
                    expect(artists[index]).to.equal(artist._id);
                    expect(artist.num_tracks).to.be.above(0);
                })
                done()
            })
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
        agent.get(serverURL + 'artists/' + invalidId)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.body.length).to.equal(0)
                done()
            })
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

    it('can stream and transcode a single track as mp3', function(done) {
        var testTrack = testData.find(function(track) {
            return track.ext == 'ogg';
        });
        var stat = fs.statSync(testTrack.path);
        agent.get(serverURL + 'play/' + testTrack._id)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.headers).to.include.keys('content-type')
                expect(res.headers['content-type']).to.equal('audio/mpeg')
                expect(res.headers).to.include.keys('content-length')
                expect(+res.headers['content-length']).to.equal(stat.size)

                done()
            })
    });

    it('behaves correctly for playing an invalid track', function(done) {
        agent.get(serverURL + 'play/' + invalidId)
            .end(function(e, res) {
                expect(e).to.exist;
                expect(e.status).to.equal(404)
                expect(res.text).to.equal('Sorry! Can\'t find it.')
                done()
            })
    });

    it('can download a single track', function(done) {
        var testTrack = testData.find(function(track) {
            return track.ext == 'wav';
        });
        var stat = fs.statSync(testTrack.path);
        agent.get(serverURL + 'download/' + testTrack._id)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200)
                expect(res.headers).to.include.keys('content-type')
                 expect(res.headers['content-type']).to.equal(testTrack.mime)
                expect(res.headers).to.include.keys('content-length')
                expect(+res.headers['content-length']).to.equal(stat.size)

                done()
            })
    });

    it('behaves correctly for downloading an invalid track', function(done) {
        agent.get(serverURL + 'download/' + invalidId)
            .end(function(e, res) {
                expect(e).to.exist;
                expect(e.status).to.equal(404)
                expect(res.text).to.equal('Sorry! Can\'t find it.')
                done()
            })
    });
});
