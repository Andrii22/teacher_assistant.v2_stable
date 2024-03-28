from flask import Blueprint, request, jsonify
import g4f
import asyncio
import json
from langdetect import detect


assistent_bp = Blueprint('assistent', __name__)

def get_response(user_input):
    response_gen = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_input}],
        stream=True,
    )
    return ''.join([message for message in response_gen])
@assistent_bp.route('/ask', methods=['POST'])
def ask():
    user_input = request.json.get('query')
    response_text = get_response(user_input)
    if detect(response_text) != 'uk':
        user_input += "Напиши відповідь українською мовою."
        response_text = get_response(user_input)
    return jsonify({'reply': response_text})