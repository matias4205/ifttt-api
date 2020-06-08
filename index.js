const http = require('http');
const child = require('child_process');
const url = require('url');
const fs = require('fs');

const defaultArgs = (containerName) => `--name ${containerName} --rm`;

const dirContent = fs.readdirSync('./', {
    encoding: "utf-8",
});

const dirHasConfig = dirContent.includes('containers.config.json');
let configFile = {}

if (dirHasConfig) {
    console.log('Config file found!');
    configFile = require(`./containers.config.json`);
}

if (!process.env.PASSWORD) {
    throw new Error('You have to set an API password!');
}

http.createServer(function (req, res) {
    const queryObject = url.parse(req.url,true).query;

    if (!queryObject['password'] || queryObject['password'] !== process.env.PASSWORD) {
        console.log(`Failed login attempt at ${new Date()}`);
        res.writeHead(403, {'Content-Type': 'text/html'});
        res.end('Forbidden');
        return;
    }
    
    if (queryObject['container'] && queryObject['action']) {
        const containerName = queryObject['container'].trim().toLowerCase().replace(/a |the /gm, '');
        const action = queryObject['action'];

        if (configFile['whiteList'] && !configFile.whiteList.includes(containerName)){
            console.log(`The ${containerName} container is not on the white list!`);
            return;
        };

        if (action === 'run') {
            console.log(`Running a ${containerName}...`);
            child.exec(`docker run ${defaultArgs(containerName)} -d ${containerName}`, (err, _stdout, _stdin) => {
                console.log({err, _stdout, _stdin});
            });
        } else if(action === 'kill') {
            console.log(`Killing the ${containerName} container...`);
            child.exec(`docker kill ${containerName}`, (err, _stdout, _stdin) => {
                console.log({err, _stdout, _stdin});
            });
        }
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
}).listen(3000);
