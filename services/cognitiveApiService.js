/**
 * Created by Léon on 07/02/2017.
 */

var request = require('request');

module.exports = {
    textAnalyticsApiPost: function(url, data, next){
        var args = {
            url: url,
            headers: {  "Content-Type": "application/json",
                        "Host": "westus.api.cognitive.microsoft.com",
                        "Ocp-Apim-Subscription-Key": "02b6d9f59cbd47b28777420818b5a758"
            },
            json: {
                documents: [
                    data
                ]
            }
        };

        request.post(args, function (err, httpResponse, data) {
            next(data.documents[0]);
        });
    }
}