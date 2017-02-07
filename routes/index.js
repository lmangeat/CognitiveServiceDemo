var express = require('express');
var router = express.Router();
var async = require('async');
var cognitiveApiService = require('../services/cognitiveApiService');

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
        console.log("score :" + score);
        res.render('index', {
            langue: langue,
            score: score});
    });
});

module.exports = router;
