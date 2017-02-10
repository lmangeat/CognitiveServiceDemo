/**
 * Created by Léon on 10/02/2017.
 */
var Twitter = require('twitter');
var tweetNumber = 0;
var fs = require('fs');

var client = new Twitter({
    consumer_key: 'TLB5mON8MQcU5XgDVn5FHgDSa',
    consumer_secret: 'wizLv1UyWpcX4AW1xp0khdFzLWYoBhL17nfvrG46QSZq8LE8VP',
    access_token_key: '4775379604-i02p3oXiYONPxkRanzdiOt1meEosNV5GyvdIKLL',
    access_token_secret: 'xp1vOZXEWOpZXhUeHwChFdyFrdcLze7Hj21B2xBW3X4Gs'
});

module.exports = {
    streamTwitter: function (callback) {
        console.log('Start Twitter Stream...');
        client.stream('statuses/filter', {track: 'porn, sex, sexe'}, function(stream) {
            stream.on('data', function(event) {
                callback(event);
                // console.log('New Tweet From: '+ event.user.screen_name + '\n' +
                //     event.text + '\n' +
                //     'Tweet number : ' + ++tweetNumber + '\n');
            });

            stream.on('error', function(error) {
                console.log(error);
            });
        });

    }
};