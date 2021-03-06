/**
 * Created by Léon on 10/02/2017.
 */
var express = require('express');
var router = express.Router();
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var twitterService = require('../services/twitterService');
var utilService = require('../services/utilService');
var confIotHub = require('../conf/iotHub.json');


router.get('/', function(req, res, next){
    var streamActive = false;
    if(global.streamTwitter){
        streamActive = true;
    }
    res.render('twitter', {streamActive: streamActive});
});

router.get('/start', function (req, res, next) {
    var client = Client.fromConnectionString(confIotHub.devices.twitter.connectionString, Protocol);
    var tweetNumber = 0;
    twitterService.streamTwitter(function (event) {
        console.log('New Tweet From: '+ event.user.screen_name + '\n' +
            event.text + '\n' +
            'Tweet number : ' + ++tweetNumber + '\n');

        var dataToAzure = JSON.stringify({
            "Tweet": event.text,
            "name": event.user.screen_name,
            "TweetNumbre": tweetNumber
        });

        //Send to Azure
        client.sendEvent(new Message(dataToAzure), function (err) {
            utilService.printErrorFor('send event');
        });
    });
    res.redirect('/twitter');
});

router.get('/stop', function (req, res, next) {
    twitterService.destroyTwitterStream();
    res.redirect('/twitter');
});

module.exports = router;