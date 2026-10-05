"""
server/flights/app.py

Flask microservice wrapping fast-flights on port 5001.
Endpoints:
  - GET /health
  - GET /search?from=DEL&to=CJB&date=2026-10-12&passengers=1&cabin=economy
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from flight_search import search_flights

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("FLIGHT_SERVICE_PORT", 5001))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Trailmate Flight Microservice",
        "port": PORT
    })


@app.route("/search", methods=["GET"])
def search():
    from_iata = request.args.get("from", "").strip().upper()
    to_iata = request.args.get("to", "").strip().upper()
    date_str = request.args.get("date", "").strip()
    passengers = int(request.args.get("passengers", 1))
    cabin = request.args.get("cabin", "economy").strip().lower()

    if not from_iata or not to_iata or not date_str:
        return jsonify({
            "error": "Parameters 'from', 'to', and 'date' are required.",
            "flights": []
        }), 400

    try:
        flights = search_flights(
            from_iata=from_iata,
            to_iata=to_iata,
            date_str=date_str,
            passengers=passengers,
            cabin=cabin,
        )

        return jsonify({
            "flights": flights,
            "count": len(flights),
            "query": {
                "from": from_iata,
                "to": to_iata,
                "date": date_str,
                "passengers": passengers,
                "cabin": cabin,
            }
        })

    except Exception as e:
        app.logger.error(f"Flight search exception: {e}")
        return jsonify({
            "error": str(e),
            "flights": []
        }), 500


if __name__ == "__main__":
    print(f"✈️  Trailmate Flight Microservice running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
