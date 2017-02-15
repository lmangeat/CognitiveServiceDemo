var express = require('express');
var router = express.Router();
var async = require('async');
var cognitiveApiService = require('../services/cognitiveApiService');
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var utilService = require('../services/utilService');
var confIotHub = require('../conf/iotHub.json');

var deviceConnectionString = confIotHub.device[0].connectionString;
var deviceId = ConnectionString.parse(deviceConnectionString).DeviceId;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
      deviceConnectionString: global.deviceConnectionString,
      deviceIdConnected: global.deviceIdConnected
  });
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
                    var score;
                    if(data){
                        score = data.score;
                    }else{
                        score = -1;
                    }
                    next(null, langue, iso6391Name, score);
                }
            );
        }
    ], function (err, langue, iso6391Name, score) {

        var client = Client.fromConnectionString(confIotHub.device[0].connectionString, Protocol);

        var dataToAzure = JSON.stringify({
            "DeviceID": deviceId,
            "Message": message,
            "Langue": langue,
            "Score": score
        });

        //Send to Azure
        client.sendEvent(new Message(dataToAzure), function (err) {
            utilService.printErrorFor('send event');
        });

        res.render('index', {
            deviceConnectionString: global.deviceConnectionString,
            deviceIdConnected: global.deviceIdConnected,
            langue: langue,
            message: message,
            score: score});
    });
});



module.exports = router;
