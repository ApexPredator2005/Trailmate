"""
server/flights/app.py

Flask microservice wrapping fast-flights on port 5001.
Endpoints:
  - GET /health
  - GET /search?from=DEL&to=CJB&date=2026-10-12&passengers=1&cabin=economy
"""

import os
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from flight_search import search_flights

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("FLIGHT_SERVICE_PORT", 5001))

VALID_CABINS = {"economy", "premium", "business", "first"}
IATA_REGEX = re.compile(r"^[A-Z]{3}$")
DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ALLOWED_SEARCH_ARGS = {"from", "to", "date", "passengers", "cabin"}


@app.errorhandler(400)
def bad_request(err):
    return jsonify({"error": "Bad request or malformed parameters.", "flights": []}), 400


@app.errorhandler(404)
def not_found(err):
    return jsonify({"error": "Endpoint not found.", "flights": []}), 404


@app.errorhandler(405)
def method_not_allowed(err):
    return jsonify({"error": "Method not allowed.", "flights": []}), 405


@app.errorhandler(500)
def internal_error(err):
    app.logger.error(f"Internal error:\n{traceback.format_exc()}")
    return jsonify({
        "error": "Flight search service encountered an unexpected error. Please try again later.",
        "flights": []
    }), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Trailmate Flight Microservice",
        "port": PORT
    })


@app.route("/search", methods=["GET"])
def search():
    # Reject unexpected query parameters (CWE-20 parameter pollution / injection defense)
    extra_args = set(request.args.keys()) - ALLOWED_SEARCH_ARGS
    if extra_args:
        return jsonify({
            "error": f"Unrecognized query parameters: {', '.join(sorted(extra_args))}",
            "flights": []
        }), 400

    from_iata = request.args.get("from", "").strip().upper()
    to_iata = request.args.get("to", "").strip().upper()
    date_str = request.args.get("date", "").strip()

    if not from_iata or not to_iata or not date_str:
        return jsonify({
            "error": "Parameters 'from', 'to', and 'date' are required.",
            "flights": []
        }), 400

    if not IATA_REGEX.match(from_iata):
        return jsonify({
            "error": f"Invalid origin IATA code '{from_iata}'. Must be a 3-letter IATA code.",
            "flights": []
        }), 400

    if not IATA_REGEX.match(to_iata):
        return jsonify({
            "error": f"Invalid destination IATA code '{to_iata}'. Must be a 3-letter IATA code.",
            "flights": []
        }), 400

    if not DATE_REGEX.match(date_str):
        return jsonify({
            "error": "Date must be in YYYY-MM-DD format.",
            "flights": []
        }), 400

    # Safe passenger parsing with bounds checking
    raw_passengers = request.args.get("passengers", "1")
    try:
        passengers = int(raw_passengers)
        if passengers < 1 or passengers > 20:
            return jsonify({
                "error": "Passenger count must be an integer between 1 and 20.",
                "flights": []
            }), 400
    except (ValueError, TypeError):
        return jsonify({
            "error": "Invalid passenger count parameter. Must be an integer.",
            "flights": []
        }), 400

    cabin = request.args.get("cabin", "economy").strip().lower()
    if cabin not in VALID_CABINS:
        return jsonify({
            "error": f"Invalid cabin class '{cabin}'. Allowed options: {', '.join(sorted(VALID_CABINS))}.",
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

    except Exception:
        app.logger.error(f"Flight search exception:\n{traceback.format_exc()}")
        return jsonify({
            "error": "Flight search service encountered an unexpected error. Please try again later.",
            "flights": []
        }), 500


if __name__ == "__main__":
    print(f"✈️  Trailmate Flight Microservice running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)

