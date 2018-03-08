import bunyan from 'bunyan';

export const logConfig = {
    name: 'music-server',
    level: 'debug',
};

// TODO: Tune this better...
if (process.env.NODE_ENV === 'test') {
    logConfig.streams = [
        {
            path: '/tmp/music-server.log', // Windows???
        },
    ];
} else {
    logConfig.stream = process.stdout;
}

const logger = bunyan.createLogger(logConfig);

export default logger;
