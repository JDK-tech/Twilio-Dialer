$(function () {
    var device;

    log("Requesting Access Token...");
    $.getJSON("./token")
        .then(function (data) {
            log("Got a token.");
            console.log("Token: " + data.token);

            // Setup Twilio.Device
            device = new Twilio.Device(data.token, {
                codecPreferences: ["opus", "pcmu"],
                fakeLocalDTMF: true,
                enableRingingState: true,
                debug: true,
            });

            device.on("ready", function () {
                log("Twilio.Device Ready! Listening for calls...");
            });

            device.on("error", function (error) {
                log("Twilio.Device Error: " + error.message);
            });

            device.on("connect", function (conn) {
                log("Successfully established call!");
                $('#modal-call-in-progress').modal('show');
            });

            device.on("disconnect", function () {
                log("Call ended.");
                $('.modal').modal('hide');
            });

            // **Handle Incoming Call**
            device.on("incoming", function (conn) {
                console.log("🔔 Incoming Call Detected!", conn.parameters);
                log("Incoming call from: " + conn.parameters.From);

                // Display incoming call modal
                $("#callerNumber").text(conn.parameters.From);
                $("#txtPhoneNumber").text(conn.parameters.From);
                $('#modal-incomming-call').modal('show');

                // **Reject Call**
                $('.btnReject').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Rejected call.");
                    conn.reject();
                });

                // **Accept Call**
                $('.btnAcceptCall').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Accepted call...");
                    conn.accept();
                });
            });
        })
        .catch(function (err) {
            console.log(err);
            log("Could not get a token from server!");
        });

    // **Dial a number**
    $('#btnDial').bind('click', function () {
        $('#modal-dial').modal('hide');

        var params = { To: document.getElementById("phoneNumber").value };
        $("#txtPhoneNumber").text(params.To);

        console.log("Calling " + params.To + "...");
        if (device) {
            var outgoingConnection = device.connect(params);
            outgoingConnection.on("ringing", function () {
                log("Ringing...");
            });
        }
    });

    // **Hang up call**
    $('.btnHangUp').bind('click', function () {
        $('.modal').modal('hide');
        log("Hanging up...");
        if (device) {
            device.disconnectAll();
        }
    });

    // **Log activity**
    function log(message) {
        var logDiv = document.getElementById("log");
        logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
        logDiv.scrollTop = logDiv.scrollHeight;
    }
});
