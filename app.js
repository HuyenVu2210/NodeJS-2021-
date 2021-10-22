const http = require('http');

const server = http.createServer((res, rep) => {
    console.log(res)
});

server.listen(3000);