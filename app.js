var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var utilService = require('./services/utilService');
var confIotHub = require('./conf/iotHub.json')
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;

var index = require('./routes/index');
var twitter = require('./routes/twitter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/twitter', twitter);

var client = Client.fromConnectionString(confIotHub.device[0].connectionString, Protocol);
client.open(function (err, result) {
    if(err){
        utilService.printErrorFor('open')(err);
    }else{
        client.on('message', function(msg){
            console.log('receive data: ' + msg.getData());
            try{
                var command = JSON.parse(message.getData());
                client.complete(msg, printErrorFor('complete'));
            }catch (err){
                utilService.printErrorFor('parse received message')(err);
                client.reject(msg, printErrorFor('reject'));
            }
        });

        client.on('error', function (err) {
            utilService.printErrorFor('client')(err);
            client.close();
        });
    }

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
