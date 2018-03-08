import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import app from '../config/express';
import config from '../config/env';
import logger from '../utils/logger';

const options = commandLineArgs([
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide',
    },
]);

if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'Music Server API',
            content: `Express + MondoDB based REST API for viewing tracks/albums/artists/genres
 stored in a db`,
        },
        {
            header:
                'Project home: [underline]{https://github.com/glenpike/music-server-express}',
        },
    ]);

    console.log(usage);
    process.exit();
}

app.listen(config.port, () => {
    logger.warn(`API started on ${config.port} (env: ${config.env})`);
});

export default app;
