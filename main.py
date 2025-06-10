from flask import Flask, render_template, jsonify, request
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.twiml.voice_response import VoiceResponse, Dial

from dotenv import load_dotenv
import os
import pprint as p

load_dotenv()

account_sid = os.environ['TWILIO_ACCOUNT_SID']
api_key = os.environ['TWILIO_API_KEY_SID']
api_key_secret = os.environ['TWILIO_API_KEY_SECRET']
twiml_app_sid = os.environ['TWIML_APP_SID']
twilio_number = os.environ['TWILIO_NUMBER']

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html', title="In browser calls")

@app.route('/token', methods=['GET'])
def get_token():
    identity = twilio_number  # Ensure identity is correctly set

    # Verify required Twilio credentials
    if not all([account_sid, api_key, api_key_secret, twiml_app_sid]):
        return jsonify({'error': 'Missing Twilio credentials'}), 500

    try:
        access_token = AccessToken(account_sid, api_key, api_key_secret, identity=identity)

        # Add Voice Grant for calling functionality
        voice_grant = VoiceGrant(
            outgoing_application_sid=twiml_app_sid,
            incoming_allow=True
        )
        access_token.add_grant(voice_grant)

        return jsonify({'token': access_token.to_jwt(), 'identity': identity})

    except Exception as e:
        return jsonify({'error': f'Failed to generate token: {str(e)}'}), 500

@app.route("/handle_calls", methods=["POST"])
def handle_calls():
    p.pprint(request.form)
    response = VoiceResponse()

    to_number = request.form.get("To")
    caller = request.form.get("Caller", "unknown")

    if to_number and to_number != twilio_number:
        print("Outbound call detected")
        dial = Dial(callerId=twilio_number)
        dial.number(to_number)
    else:
        print("Incoming call detected")
        dial = Dial(callerId=caller)

        # Forwarding numbers (unchanged as per request)
        forwarding_numbers = ["+18108191394", "+13137658399", "+15177778712", "+18105444469", "+17346009019", "+17343664154", "+15863023066", "+15177451309"]

        # Try forwarding to each number with a timeout
        for number in forwarding_numbers:
            dial.number(number, timeout=20)

    response.append(dial)
    return str(response)

@app.route('/forward_call', methods=['POST'])
def forward_call():
    caller = request.form.get("caller")
    forward_to = request.form.get("forwardTo")

    response = VoiceResponse()
    dial = Dial(callerId=caller)
    dial.number(forward_to)

    response.append(dial)
    return str(response)

@app.route('/transfer_call', methods=['POST'])
def transfer_call():
    caller = request.form.get("caller")
    transfer_to = request.form.get("transferTo")

    response = VoiceResponse()
    dial = Dial(callerId=caller)
    dial.number(transfer_to)

    response.append(dial)
    return str(response)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000, debug=False)
