/**
 * Created by Léon on 15/02/2017.
 */
var socket = io.connect('http://localhost:3500');
socket.on('message', function (data) {
    $('#messages').append(data+'<br/><br/>');
});