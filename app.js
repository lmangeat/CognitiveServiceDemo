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
var exphbs = require('express-handlebars');
var iothubService = require('./services/IotHubService');
var EventHubClient = require('azure-event-hubs').Client;

var index = require('./routes/index');
var twitter = require('./routes/twitter');
var admin = require('./routes/admin');

var app = express();
var port = 3500
if(process.env.port){
    port = process.env.port;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('handlebars-helpers')()
}));
app.set("view engine", "handlebars");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/twitter', twitter);
app.use('/admin', admin);

var io = require('socket.io').listen(app.listen(port));
app.io = io;
io.sockets.on('connection', function (socket) {});


var deviceConnectionString = confIotHub.device[0].connectionString;
var deviceIdConnected = confIotHub.device[0].deviceId;

iothubService.openDevice(deviceConnectionString, deviceIdConnected, function () {});

var eventClient = EventHubClient.fromConnectionString(confIotHub.connectionString);
eventClient.open()
    .then(eventClient.getPartitionIds.bind(eventClient))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return eventClient.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId);
                receiver.on('message', function (message) {
                    io.emit('message', JSON.stringify(message.body));
                });
            });
        });
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
