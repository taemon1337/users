var server = require('http').createServer()
  , express = require('express')
  , request = require('request')
  , app = express()
  , port = process.env.PORT || 8080
  , env = process.env.ENV || 'dev'
  , API = process.env.API || 'http://api:8080'
  ;

app.use(express.static('web'));
app.use('/common', express.static('/common'));

app.get('/me', function(req, res) {
  var uid = req.headers['X-SSL-Client-S-DN'] || env === 'dev' ? req.headers['userdn'] : null;
  request(API+'/api/users/'+uid).pipe(res);
});

app.all('/api*', function(req, res) {
  req.pipe(request(API+req.originalUrl)).pipe(res);
});

server.on('request', app);
server.listen(port, function() { console.log('Listening on ' + server.address().port) });
