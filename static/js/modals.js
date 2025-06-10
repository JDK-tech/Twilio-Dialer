$(document).ready(function () {
    let btnOpenNumberPad = document.getElementById('btnOpenNumberPad');
    let inputPhoneNumber = document.getElementById('phoneNumber');
    let btnDelete = document.getElementById('btnDelete');

    btnOpenNumberPad.addEventListener('click', (event) => {
        $('#modal-dial').modal('show');
    });

    $('#btnCloseDialModal').bind('click', function () {
        $('#modal-dial').modal('hide');
    });

    $('.btnNumber').bind('click', function () {
        let text = $(this).text();
        inputPhoneNumber.value += text;
    });

    btnDelete.addEventListener('click', (event) => {
        console.log('clicked', event);
        var str = inputPhoneNumber.value;
        var position = inputPhoneNumber.selectionStart - 1;

        str = str.substr(0, position) + '' + str.substr(position + 1);
        inputPhoneNumber.value = str;
    });

    // Ensure Incoming Calls Trigger the Modal
    device.on("incoming", function (conn) {
        log("Incoming call from: " + conn.parameters.From);
        $("#callerNumber").text(conn.parameters.From);
        $("#txtPhoneNumber").text(conn.parameters.From);
        $('#modal-incomming-call').modal('show');

        $('.btnReject').unbind().bind('click', function () {
            $('.modal').modal('hide');
            log("Rejected call.");
            conn.reject();
        });

        $('.btnAcceptCall').unbind().bind('click', function () {
            $('.modal').modal('hide');
            log("Accepted call...");
            conn.accept();
        });
    });

    // Call Duration Timer
    $("#modal-call-in-progress").on('shown.bs.modal', function () {
        showCallDuration();
    });

    function showCallDuration() {
        let output = document.getElementById('callDuration');
        let ms = 0, sec = 0, min = 0;

        function timer() {
            ms++;
            if (ms >= 100) { sec++; ms = 0; }
            if (sec === 60) { min++; sec = 0; }

            let timer = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
            output.innerHTML = timer;
        };

        function start() { time = setInterval(timer, 10); }
        function stop() { clearInterval(time); }
        function reset() { ms = sec = min = 0; output.innerHTML = "00:00"; }

        start();

        $("#modal-call-in-progress").on('hidden.bs.modal', function () {
            stop();
        });
    }
});
