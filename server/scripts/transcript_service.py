#!/usr/bin/env python3
"""
Simple Flask microservice to fetch YouTube transcripts
Run with: python transcript_service.py
Then update USE_MOCK_DATA to false and set TRANSCRIPT_SERVICE_URL in .env
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import sys

app = Flask(__name__)
CORS(app)

@app.route('/transcript/<video_id>', methods=['GET'])
def get_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        return jsonify({
            "success": True,
            "transcript": transcript_list
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print("YouTube Transcript Service starting on http://localhost:5001")
    print("Install dependencies: pip install flask flask-cors youtube-transcript-api")
    app.run(host='0.0.0.0', port=5001, debug=True)
