const http = require('http');

const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log("This is a middleware");
    next();
});

app.use((req, res, next) => {
    console.log("This is another middleware")
})

const server = http.createServer(app);

server.listen(3000);