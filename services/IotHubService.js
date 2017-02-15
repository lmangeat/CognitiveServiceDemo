/**
 * Created by Léon on 15/02/2017.
 */
var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;
var utilService = require('./utilService');
var EventHubClient = require('azure-event-hubs').Client;
var confIotHub = require('../conf/iotHub.json');

module.exports = {
    openDevice: function (connectionString, deviceId, next) {
        global.deviceConnectionString = connectionString;
        global.deviceIdConnected = deviceId;
        var client = Client.fromConnectionString(connectionString, Protocol);
        client.open(function (err, result) {
            if(err){
                utilService.printErrorFor('open')(err);
            }else{
                client.on('error', function (err) {
                    utilService.printErrorFor('client')(err);
                    client.close();
                });
                next();
            }

        });
    },
    closeDevice: function (connectionString) {
        var client = Client.fromConnectionString(connectionString, Protocol);
        client.close(function (err, result) {
            if(err){
                utilService.printErrorFor('open')(err);
            }
        });
    }
}