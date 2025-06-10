$(function () {
    var device;

    log("Requesting Access Token...");
    $.getJSON("./token")
        .then(function (data) {
            device = new Twilio.Device(data.token, {
                codecPreferences: ["opus", "pcmu"],
                fakeLocalDTMF: true,
                enableRingingState: true,
                debug: true,
            });

            device.updateToken(data.token);

            device.on("ready", function () {
                log("Twilio.Device Ready!");
            });

            device.on("error", function (error) {
                log("Twilio.Device Error: " + error.message);
            });

            device.on("connect", function (conn) {
                $('#modal-call-in-progress').modal('show');
            });

            device.on("disconnect", function () {
                $('.modal').modal('hide');
            });

            // Handle Incoming Call
            device.on("incoming", function (conn) {
                $("#callerNumber").text(conn.parameters.From);
                $("#txtPhoneNumber").text(conn.parameters.From);
                $('#modal-incomming-call').modal('show');

                $('.btnAcceptCall').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    conn.accept();
                });

                $('.btnReject').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    conn.reject();
                });
            });
        })
        .catch(function (err) {
            log("Could not get a token from server!");
        });
});
