from flask import Flask, request, jsonify, render_template
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.twiml.voice_response import VoiceResponse, Dial
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Twilio credentials
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
api_key = os.getenv("TWILIO_API_KEY_SID")
api_key_secret = os.getenv("TWILIO_API_KEY_SECRET")
twiml_app_sid = os.getenv("TWIML_APP_SID")
twilio_number = os.getenv("TWILIO_NUMBER")

app = Flask(__name__)

# Enable logging for debugging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return render_template('home.html', title="Twilio Web Dialer")

@app.route('/token', methods=['GET'])
def get_token():
    identity = twilio_number  # Ensure correct identity

    if not all([account_sid, api_key, api_key_secret, twiml_app_sid]):
        return jsonify({'error': 'Missing Twilio credentials'}), 500

    try:
        # Generate token
        access_token = AccessToken(account_sid, api_key, api_key_secret, identity=identity)
        voice_grant = VoiceGrant(outgoing_application_sid=twiml_app_sid, incoming_allow=True)
        access_token.add_grant(voice_grant)

        return jsonify({'token': access_token.to_jwt(), 'identity': identity})

    except Exception as e:
        return jsonify({'error': f'Failed to generate token: {str(e)}'}), 500

from flask import Flask, request, Response
from twilio.twiml.voice_response import VoiceResponse, Dial

app = Flask(__name__)

@app.route("/voice", methods=["POST"])
def voice():
    response = VoiceResponse()
    dial = Dial(callerId=request.form.get("Caller", "unknown"))

    forwarding_numbers = ["+18108191394", "+13137658399", "+15177778712", "+18105444469", "+17346009019", "+17343664154", "+15863023066", "+15177451309"]
    for number in forwarding_numbers:
        dial.number(number, timeout=20)

    response.append(dial)

    return Response(str(response), mimetype="text/xml")  # Ensure correct TwiML response format

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000, debug=True)
