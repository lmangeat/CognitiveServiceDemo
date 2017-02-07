var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;


/* GET home page. */
router.get('/', function(req, res, next) {
    // res.render('index', { title: 'Express' });

    var client = new Client();
    // set content-type header and data as json in args parameter
    var args = {
        data: {
            "documents": [
                {
                    "id": "1",
                    "text": "Bonjour"
                }
            ]
        },
        headers: { "Content-Type": "application/json",
                    "Host": "westus.api.cognitive.microsoft.com",
                    "Ocp-Apim-Subscription-Key": "02b6d9f59cbd47b28777420818b5a758"
        }
    };

    client.post("https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages", args, function (data, response) {
        res.send(data);
    });
});

module.exports = router;
