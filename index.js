const http = require('http');
const child = require('child_process');
const url = require('url');
const fs = require('fs');

const sanetizeString = (str) => str.trim().replace(/a |the /gm, '').split(" ")[0].toLowerCase();

const defaultArgs = (containerName) => `--name ${containerName} --rm`;

const dirContent = fs.readdirSync('./', {
    encoding: "utf-8",
});

const dirHasConfig = dirContent.includes('containers.config.json');
let configFile = {}

if (dirHasConfig) {
    console.log('Config file found!');
    try {
        configFile = require(`./containers.config.json`);
    } catch (err) {
        console.log('Error requiring config! Skipping...');
    }
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
        const containerName = sanetizeString(queryObject['container']);
        const action = queryObject['action'];

        if (configFile['whitelist'] && !configFile.whitelist.includes(containerName)){
            console.log(`The ${containerName} container is not on the white list!`);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end();
            return;
        };

        if (action === 'run') {
            console.log(`Running a ${containerName} container...`);
            child.exec(`docker run ${defaultArgs(containerName)} -d ${containerName}`, (err) => {
                if(err){
                    console.error(`Error: ${err.message}`);
                }
            });
        } else if(action === 'kill') {
            console.log(`Killing the ${containerName} container...`);
            child.exec(`docker kill ${containerName}`, (err) => {
                if(err){
                    console.error(`Error: ${err.message}`);
                }
            });
        }
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end();
}).listen(3000);
