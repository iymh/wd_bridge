// const http = require('http');

// http.createServer(function (request, response) {
//    target = process.env.TARGET ? process.env.TARGET : 'World' ;
//    msg = process.env.MSG ? process.env.MSG : 'Hello ' + target + '\n';
//    response.writeHead(200, {'Content-Type': 'text/plain'});
//    response.end(msg);
// }).listen(8080);

// console.log('Server running at http://0.0.0.0:8080/');

const AUTHINFO = {
   username:"test",
   password:"test"
};

const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth-connect');

const DiscoveryV2 = require('ibm-watson/discovery/v2');
const { IamAuthenticator } =require('ibm-watson/auth');

var server = express();
server
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({
     extended: false
   }))

   // Basic Auth
   .use(basicAuth(
      AUTHINFO.username,
      AUTHINFO.password 
   ))

   .get('/', function (req, res) {
      res.send('watson discovery bridge!')
   })

   .post('/api', async (req, res) => {
      let body = req.body;

      // Check Params
      if (!(body.projectId && body.projectId.length > 1)) {
         res.status(500).send({"error": "Invalid projectId!"});
         return;
      }

      const discovery = new DiscoveryV2({
         version: '{version}',
         authenticator: new IamAuthenticator({
            apikey: process.env.API_KEY,
         }),
         version: '2020-08-30',
         serviceUrl: process.env.API_BASE_URL,
      });

      discovery.query(body)
         .then(response => {
            console.log(JSON.stringify(response.result, null, 2));
            res.json(response.result);
         })
         .catch(err => {
            console.log('error:', err);
            res.status(500).send({"error": "Failed Watson Discovery Query."});
         });
   });

const port = process.env.PORT || 8080;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Server running on port: %d', port);
  console.log('process.env: ', process.env);
});

