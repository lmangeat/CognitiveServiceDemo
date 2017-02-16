/**
 * Created by Léon on 15/02/2017.
 */
var express = require('express');
var router = express.Router();
var IotHub = require('azure-iothub');
var confIotHub = require('../conf/iotHub.json');
var uuid = require('uuid');
var iothubService = require('../services/IotHubService');
var _ = require('lodash');

var iothubConnectionString = confIotHub.IoTHub.connectionString;
var registry = IotHub.Registry.fromConnectionString(iothubConnectionString);

router.get('/', function (req, res, next) {
    registry.list(function (err, devices) {
        devices.map(function (device) {
            if(_.find([confIotHub.devices.default, confIotHub.devices.twitter], {deviceId: device.deviceId})){
                device.isReadOnly = true;
            }
        });
        res.render('admin', {devices: devices, deviceIdConnected: global.deviceIdConnected, defaultDevices: confIotHub.device});
    })
});

router.get('/device/add', function (req, res, next) {
    var device = new IotHub.Device();
    device.deviceId = uuid();
    registry.create(device, function (err, deviceCreated) {
        res.redirect('/admin');
    });
});

router.get('/device/delete/:id', function (req, res, next) {
    var deviceId = req.params.id;
    if(deviceId == global.deviceIdConnected){
        iothubService.openDevice(confIotHub.devices.default.connectionString, confIotHub.devices.default.deviceId, function () {
        });
    }
    registry.get(deviceId, function (err, device) {
        var connectionString = "HostName="+confIotHub.IoTHub.HostName+";DeviceId="+deviceId+";SharedAccessKey="+device.authentication.symmetricKey.primaryKey;
        iothubService.closeDevice(connectionString);
        registry.delete(deviceId, function (err, device) {
            res.redirect('/admin');
        });
    });

});

router.get('/device/open/:id', function (req, res, next) {
    iothubService.closeDevice(global.deviceConnectionString);
    var deviceId = req.params.id;
    registry.get(deviceId, function (err, device) {
        var connectionString = "HostName="+confIotHub.IoTHub.HostName+";DeviceId="+deviceId+";SharedAccessKey="+device.authentication.symmetricKey.primaryKey;
        iothubService.openDevice(connectionString, deviceId, function () {
            res.redirect('/admin');
        });
    });
});

module.exports = router;