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

            // Ensure Twilio.Device updates token dynamically
            device.updateToken(data.token);

            device.on("ready", function () {
                log("Twilio.Device Ready! Waiting for incoming calls...");
                console.log("Twilio.Device initialized successfully.");
            });

            device.on("error", function (error) {
                log("Twilio.Device Error: " + error.message);
                console.error("Twilio error:", error);
            });

            device.on("connect", function (conn) {
                log("Call connected!");
                console.log("Call in progress...");
                $('#modal-call-in-progress').modal('show');
            });

            device.on("disconnect", function () {
                log("Call ended.");
                console.log("Call disconnected.");
                $('.modal').modal('hide');
            });

            // **Handle Incoming Call**
            device.on("incoming", function (conn) {
                console.log("🔔 Incoming Call Detected!", conn.parameters);
                log("Call from: " + conn.parameters.From);

                // Show incoming call modal
                $("#callerNumber").text(conn.parameters.From);
                $("#txtPhoneNumber").text(conn.parameters.From);
                $('#modal-incomming-call').modal('show');

                // Accept Call
                $('.btnAcceptCall').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Accepted call...");
                    console.log("Call accepted.");
                    conn.accept();
                });

                // Reject Call
                $('.btnReject').unbind().bind('click', function () {
                    $('.modal').modal('hide');
                    log("Rejected call.");
                    console.log("Call rejected.");
                    conn.reject();
                });
            });
        })
        .catch(function (err) {
            console.error("Error fetching token:", err);
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
        console.log("Ending call...");
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
