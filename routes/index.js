var express = require('express');
var router = express.Router();
var async = require('async');
var cognitiveApiService = require('../services/cognitiveApiService');
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;

var deviceConnectionString = "HostName=CognitiveServiceDemo-IoTHub.azure-devices.net;DeviceId=textAnalyticsDevice;SharedAccessKey=zzNZLmKys/NGPSptMzeYyLdAZac/aAqxTOpA6bJj1Tc=";
var deviceId = ConnectionString.parse(deviceConnectionString).DeviceId;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/**
 * POST home page
 */
router.post('/', function(req, res, next) {
    var message = req.body.message;
    var url_language =  "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages";
    var url_sentiment = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment";

    async.waterfall([
        function (next) {
            cognitiveApiService.textAnalyticsApiPost(url_language,
                {
                    id: "1",
                    text: message
                }, function (data) {
                    var langue = data.detectedLanguages[0].name;
                    var iso6391Name = data.detectedLanguages[0].iso6391Name;
                    next(null, langue, iso6391Name);
                }
            );
        },
        function (langue, iso6391Name, next) {
            cognitiveApiService.textAnalyticsApiPost(url_sentiment,
                {
                    id: "1",
                    language: iso6391Name,
                    text: message
                }, function (data) {
                    var score = data.score;
                    next(null, langue, iso6391Name, score);
                }
            );
        }
    ], function (err, langue, iso6391Name, score) {

        var client = Client.fromConnectionString(deviceConnectionString, Protocol);

        client.open(function (err, result) {
            if(err){
                printErrorFor('open')(err);
            }else{
                client.on('message', function(msg){
                    console.log('receive data: ' + msg.getData());
                    try{
                        var command = JSON.parse(message.getData());
                        client.complete(msg, printErrorFor('complete'));
                    }catch (err){
                        printErrorFor('parse received message')(err);
                        client.reject(msg, printErrorFor('reject'));
                    }
                });

                client.on('error', function (err) {
                    printErrorFor('client')(err);
                    client.close();
                });
            }

        });

        var dataToAzure = JSON.stringify({
            "DeviceID": deviceId,
            "Message": message,
            "Langue": langue,
            "Score": score
        });

        //Send to Azure
        client.sendEvent(new Message(dataToAzure), function (err) {
            printErrorFor('send event');
            client.close();
        });

        res.render('index', {
            langue: langue,
            message: message,
            score: score});
    });
});

// Helper function to print results for an operation
function printErrorFor(op) {
    return function printError(err) {
        if (err) console.log(op + ' error: ' + err.toString());
    };
}

module.exports = router;
