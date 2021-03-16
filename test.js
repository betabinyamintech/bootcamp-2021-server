const request = require('superagent')

const serverUrl = 'http://localhost:'+process.env.TESTPORT;

request.post(serverUrl + '/login')
        .set('Accept', 'application/json')
        .send({email: "a", password: "b"})
        .then(result => 
            console.log(result.body.token))
request.post(serverUrl + '/hi')
        .set('Accept', 'application/json')
        .send({email: "a", password: "b"})
        .then(result => 
            console.log(result.body.token))
request.post(serverUrl + '/login')
        .set('Accept', 'application/json')
        .send({email: "a", password: "b"})
        .then(result => 
            console.log(result.body.token))
