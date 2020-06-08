var http = require('http');
var child = require('child_process');
const url = require('url');

//create a server object:
http.createServer(function (req, res) {
    const queryObject = url.parse(req.url,true).query;

    if (queryObject['password']) {
        const password = queryObject['password'];
        if (password !== 'pepote333') {
            res.writeHead(403, {'Content-Type': 'text/html'});
            res.end('Get the fuck out, this API is secured!');
        }
    } else {
        res.writeHead(403, {'Content-Type': 'text/html'});
        res.end('Get the fuck out, this API is secured!');
    }
    
    if (queryObject['container'] && queryObject['action']) {
        const cleanContainerName = queryObject['container'].replace(/a |the /gm, '');
        const action = queryObject['action'];
        console.log({ action, cleanContainerName });

        switch(cleanContainerName) {
            case 'mysql':
            case 'mongo': {
                if (action === 'run') {
                    console.log(`Running a ${cleanContainerName}`);
                    child.exec(`docker run --name ${cleanContainerName} --rm -d ${cleanContainerName}`, (err, _stdout, _stdin) => {
                        console.log({err, _stdout, _stdin});
                    });
                } else if(action === 'kill') {
                    console.log(`Killing the ${cleanContainerName} container`);
                    child.exec(`docker kill ${cleanContainerName}`, (err, _stdout, _stdin) => {
                        console.log({err, _stdout, _stdin});
                    });
                }
                break;
            }
        }
    }


    res.writeHead(200, {'Content-Type': 'text/html'});
}).listen(3000); //the server object listens on port 8080 