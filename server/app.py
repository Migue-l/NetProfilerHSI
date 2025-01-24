from flask import Flask, jsonify, request
from flask_cors import CORS
#from waitress import serve

# Create 'main' app obj
app = Flask(__name__)
CORS(app)

@app.route('/api/new-card', methods=['POST'])
def newCard():
    # Parse the incoming JSON request
    data = request.get_json()

    # Access fields from the request body
    card_name = data.get('cardName', 'Unnamed Card')
    created_at = data.get('createdAt', 'Unknown Time')

    # Log or handle the card data as needed (e.g., save to a database)
    print(f"New Card Created: {card_name}, at {created_at}")

    # Send a response back to the client
    return jsonify({
        "message": "Card created successfully",
        "cardName": card_name,
        "createdAt": created_at
    }), 201  # 201 Created status code


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
