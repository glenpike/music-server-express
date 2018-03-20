import bunyan from 'bunyan';
import os from 'os';
import path from 'path';

export const logConfig = {
    name: 'music-server',
    level: 'debug',
};

if (process.env.NODE_ENV === 'test') {
    const tmpPath = path.join(os.tmpdir(), 'music-server.log');
    logConfig.streams = [
        {
            path: tmpPath,
        },
    ];
} else {
    logConfig.stream = process.stdout;
}

const logger = bunyan.createLogger(logConfig);

export default logger;
