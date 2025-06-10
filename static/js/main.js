$(function () {
    var device;

    log("Requesting Access Token...");
    $.getJSON("./token")
        .then(function (data) {
            log("Got a token.");
            console.log("Token: " + data.token);

            device = new Twilio.Device(data.token, {
                codecPreferences: ["opus", "pcmu"],
                fakeLocalDTMF: true,
                enableRingingState: true,
                debug: true,
            });

            device.on("ready", function () {
                log("Twilio.Device Ready! Listening for incoming calls...");
            });

            device.on("error", function (error) {
                log("Twilio.Device Error: " + error.message);
            });

            device.on("connect", function (conn) {
                log("Call connected!");
                $('#modal-call-in-progress').modal('show');
            });

            device.on("disconnect", function () {
                log("Call ended.");
                $('.modal').modal('hide');
            });

            // Handle Incoming Call
            device.on("incoming", function (conn) {
                console.log("🔔 Incoming Call Detected!", conn.parameters);
                log("Incoming call from: " + conn.parameters.From);

                $("#callerNumber").text(conn.parameters.From);
                $("#txtPhoneNumber").text(conn.parameters.From);
                $('#modal-incomming-call').modal('show');

                // Accept Call
                $('.btnAcceptCall').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Accepted call...");
                    conn.accept();
                });

                // Reject Call
                $('.btnReject').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Rejected call.");
                    conn.reject();
                });
            });
        })
        .catch(function (err) {
            console.log("Error fetching token:", err);
            log("Could not get a token from server!");
        });
});
