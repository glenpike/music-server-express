import express from 'express';
import fs from 'fs';
import { collection } from '../../db';

const router = express.Router();

//FIXME - investigate settings, etc.
function transcode(file) {
    const spawn = require('child_process').spawn;

    const decode = spawn('flac', ['--decode', '--stdout', file]);

    const encode = spawn('lame', ['-V0', '-', '-']);

    decode.stdout.pipe(encode.stdin);

    return encode;
}

router.get('/play/:id', function(req, res, next) {
    collection.findOne({ _id: req.params.id }, function(e, result) {
        if (e) {
            req.log.error('Error finding track: ', err);
            return next(e);
        }
        if (!result) {
            res.status(404).send("Sorry! Can't find it.");
        } else {
            req.log.debug('will stream file ', result);
            const fs = require('fs');
            const stat = fs.statSync(result.path);
            res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size,
            });
            let readStream;
            if (-1 === result.mime.indexOf('mpeg')) {
                req.log.debug('not an mpeg file, will transcode ', result);

                readStream = transcode(result.path).stdout;
            } else {
                readStream = fs.createReadStream(result.path);
            }
            readStream.pipe(res);
            readStream.on('end', function() {
                req.log.debug('readStream end');
            });
        }
    });
});

router.get('/download/:id', function(req, res, next) {
    collection.findOne({ _id: req.params.id }, function(e, result) {
        if (e) {
            req.log.error('Error finding track: ', err);
            return next(e);
        }
        if (!result) {
            res.status(404).send("Sorry! Can't find it.");
        } else {
            const fs = require('fs');
            const stat = fs.statSync(result.path);
            const options = {
                headers: {
                    'Content-Type': result.mime,
                    'Content-Length': stat.size,
                },
            };

            res.sendFile(result.path, options, function(err) {
                if (err) {
                    req.log.error('Error sending downloaded track: ', err);
                    res.status(err.status).end();
                } else {
                    req.log.debug('Sent downloaded track: ', result.path);
                }
            });
        }
    });
});

module.exports = router;
