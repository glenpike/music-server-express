// import mongoose from 'mongoose';
import app from '../config/express';
import config from '../config/env';
import commandLineArgs from 'command-line-args';

const cli = commandLineArgs([
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide',
    },
    {
        name: 'test',
        alias: 't',
        type: Boolean,
        description: 'Use the test configuration',
    },
]);
const options = cli.parse();

if (options.help) {
    const usage = cli.getUsage({
        title: 'server',
        description: 'Music Server API',
        footer: 'Project home: [underline]{https://github.com/me/my-app}',
    });

    console.log(usage);
    process.exit();
}

app.listen(config.port, () => {
    console.log(`API started on ${config.port} (env: ${config.env})`);
});

export default app;
