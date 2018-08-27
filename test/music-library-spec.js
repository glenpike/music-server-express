/* global require, it, describe, before, after, __dirname */
import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import md5 from 'md5';
import supertest from 'supertest';
// import request from 'superagent';
import app from '../config/express';
import pool from '../db/index';

chai.use(chaiThings);

const serverURL = '/api/';
// const serverURL = 'http://localhost:3000/api/';

const path = require('path');
const fs = require('fs');
const testData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './data/files.json'))
);

const uniqueAlbums = [];
const uniqueArtists = [];
const uniqueGenres = [];

const invalidId = 'no-such-thing';

function uniqueItems(src, target) {
    src.forEach(function(item) {
        if (-1 === target.indexOf(item)) {
            target.push(item);
        }
    });
}

//Map the expected data to various arrays to make it easier to test.
const testIds = testData.map(function(item) {
    if (item.metadata) {
        const album = item.metadata.album;
        if (album && -1 === uniqueAlbums.indexOf(album)) {
            uniqueAlbums.push(album);
        }
        const genres = item.metadata.genre;
        if (genres && genres.length) {
            uniqueItems(genres, uniqueGenres);
        }
        const artists = item.metadata.artist;
        if (artists && artists.length) {
            uniqueItems(artists, uniqueArtists);
        }
    }
    return item.id;
});

uniqueAlbums.sort();
uniqueArtists.sort();
uniqueGenres.sort();

describe('music-server library API tests', function() {
    let request = null;
    let server = null;
    before(function(done) {
        server = app.listen(done);
        request = supertest.agent(server);
    });

    after(function(done) {
        server.close(() => {
            pool.end(() => {
                done();
            });
        });
    });

    it.only('retrieves a list of tracks', function(done) {
        request.get(serverURL + 'tracks').end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.equal(testData.length);
            res.body.forEach(function(track) {
                expect(testIds).to.contain(track.id);
            });
            done();
        });
    });

    it.only('retrieves info for a single track', function(done) {
        //metadata for wav is not consistent
        const testTrack = testData.find(function(track) {
            return track.ext != 'wav';
        });
        request.get(serverURL + 'tracks/' + testTrack.id).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body).to.deep.equal(testTrack);
            done();
        });
    });

    it.only('behaves correctly for posting an invalid track', function(done) {
        request
            .post(serverURL + 'tracks/')
            .send({ path: 'Blah', invalid: 'blah' })
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(400);
                expect(res.body.status).to.equal('error');
                expect(res.body.message).to.contain('missing required field');
                done();
            });
    });

    let testId = null;
    const testFile = {
        path: 'my-path.wav',
        ext: 'wav',
        mime: 'audio/x-wav',
        metadata: {
            title: 'Test File',
            artist: ['Superrequest'],
            album: 'Greatest Test',
        },
    };

    it.only('behaves correctly for posting a valid track', function(done) {
        request
            .post(serverURL + 'tracks/')
            .send(testFile)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(201);
                expect(res.body.id).to.exist;
                testId = res.body.id;
                expect(res.body).to.deep.include(testFile);
                done();
            });
    });

    it.only('behaves correctly for updating an invalid track', function(done) {
        request
            .patch(serverURL + 'tracks/invalidId')
            .send({ path: 'Blah', invalid: 'blah' })
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(404);
                expect(res.body.status).to.equal('error');
                expect(res.body.message).to.contain('TRACK_NOT_FOUND');
                done();
            });
    });

    it.only('behaves correctly for updating a valid track', function(done) {
        const updatedFile = {
            metadata: {
                title: 'Such Test',
                artist: ['So shiny'],
                album: 'Greatest Wow',
            },
        };
        request
            .patch(serverURL + 'tracks/' + testId)
            .send(updatedFile)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200);
                expect(res.body.id).to.exist;
                expect(res.body.path).to.equal(testFile.path);
                expect(res.body).to.deep.include(updatedFile);
                done();
            });
    });

    it.only('behaves correctly for deleting a valid track', function(done) {
        request
            .delete(serverURL + 'tracks/' + md5(testFile.path))
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(204);
                expect(res.body).to.be.empty;
                done();
            });
    });

    it.only('behaves correctly for getting an invalid track', function(done) {
        request.get(serverURL + 'tracks/' + invalidId).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.contain('TRACK_NOT_FOUND');
            done();
        });
    });

    it('retrieves a sorted list of albums', function(done) {
        request.get(serverURL + 'albums').end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.equal(uniqueAlbums.length);
            res.body.forEach(function(album, index) {
                expect(uniqueAlbums[index]).to.equal(album._id);
                expect(album.num_tracks).to.be.above(0);
            });
            done();
        });
    });

    it('retrieves track list for an album', function(done) {
        const album = uniqueAlbums[0],
            testAlbum = testData.filter(function(track) {
                if (!track.metadata) {
                    return false;
                }
                return track.metadata.album === album;
            });
        testAlbum.sort(function(a, b) {
            return a.metadata.track.no - b.metadata.track.no;
        });

        request.get(serverURL + 'albums/' + album).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.deep.equal(testAlbum.length);
            res.body.forEach(function(track, index) {
                expect(testAlbum[index]._id).to.equal(track.id);
                expect(track.track).to.equal(index + 1);
            });
            done();
        });
    });

    it('behaves correctly for getting an invalid album', function(done) {
        request.get(serverURL + 'albums/' + invalidId).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(0);
            done();
        });
    });

    function testList(type, expected, done) {
        request.get(serverURL + type).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.equal(expected.length);
            res.body.forEach(function(item) {
                expect(expected).to.contain(item._id);
                expect(item.num_tracks).to.be.above(0);
            });
            done();
        });
    }

    function testInvalidItem(type, done) {
        request.get(serverURL + type + '/' + invalidId).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(0);
            done();
        });
    }

    it('retrieves a list of genres', function(done) {
        testList('genres', uniqueGenres, done);
    });

    it('retrieves track list for a genre', function(done) {
        const genre = uniqueGenres[0],
            testGenre = testData
                .filter(function(track) {
                    if (!track.metadata) {
                        return false;
                    }
                    return track.metadata.genre[0] === genre;
                })
                .map(function(track) {
                    return track._id;
                });

        request.get(serverURL + 'genres/' + genre).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.deep.equal(testGenre.length);
            res.body.forEach(function(track) {
                expect(testGenre).to.contain(track.id);
                expect(track.title).to.exist;
                expect(track.artist).to.exist;
                expect(track.album).to.exist;
                expect(track.path).to.exist;
            });
            done();
        });
    });

    it('behaves correctly for getting an invalid genre', function(done) {
        testInvalidItem('genres', done);
    });

    it('retrieves a sorted list of artists', function(done) {
        testList('artists', uniqueArtists, done);
    });

    it('retrieves track list for an artist', function(done) {
        const artist = 'Glen Pike',
            testArtist = testData
                .filter(function(track) {
                    if (!track.metadata) {
                        return false;
                    }
                    return track.metadata.artist[0] === artist;
                })
                .map(function(track) {
                    return track._id;
                });

        request.get(serverURL + 'artists/' + artist).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.deep.equal(testArtist.length);
            res.body.forEach(function(track) {
                expect(testArtist).to.contain(track.id);
                expect(track.title).to.exist;
                expect(track.artist).to.equal(artist);
                expect(track.album).to.exist;
                expect(track.path).to.exist;
            });
            done();
        });
    });

    it('behaves correctly for getting an invalid artist', function(done) {
        testInvalidItem('artists', done);
    });

    it('retrieves a list of all track data', function(done) {
        request.get(serverURL + 'all-tracks').end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.body.length).to.equal(testData.length);
            res.body.forEach(function(track) {
                expect(testIds).to.contain(track._id);
            });
            done();
        });
    });

    function testValidTrackAction(type, ext, done) {
        const testTrack = testData.find(function(track) {
            return track.ext == ext;
        });
        let expectedMime = 'audio/mpeg';
        if ('download' === type) {
            expectedMime = testTrack.mime;
        }

        const stat = fs.statSync(testTrack.path);
        request
            .get(serverURL + type + '/' + testTrack._id)
            .end(function(e, res) {
                expect(e).to.not.exist;
                expect(res.status).to.equal(200);
                expect(res.headers).to.include.keys('content-type');
                expect(res.headers['content-type']).to.equal(expectedMime);
                expect(res.headers).to.include.keys('content-length');
                expect(+res.headers['content-length']).to.equal(stat.size);

                done();
            });
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
        request.get(serverURL + type + '/' + invalidId).end(function(e, res) {
            expect(e).to.not.exist;
            expect(res.status).to.equal(404);
            expect(res.text).to.equal("Sorry! Can't find it."); // eslint-disable-line quotes
            done();
        });
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
