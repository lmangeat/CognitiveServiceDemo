/**
 * Created by Léon on 10/02/2017.
 */
module.exports = {
    printErrorFor: function (op) {
        return function printError(err) {
            if (err) console.log(op + ' error: ' + err.toString());
        };
    }
}