from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
#from waitress import serve

# Create 'main' app obj
app = Flask(__name__)
CORS(app)

@app.route('/api/new-card', methods=['POST'])
def newCard():
    # Parse the incoming JSON fetch request
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

@app.route('/api/csv-test', methods=['POST'])
def get_csv_data():
    try:
        df = pd.read_csv('test.csv')
        # Convert DataFrame to a dictionary (JSON-friendly format)
        data = df.to_dict(orient='split')
        # Send json response to the front-end
        return jsonify(data)
    except Exception as e:
        # Code 500 is an HTML server error 
        return jsonify({"Server Error": f"Failed to read CSV file: {str(e)}"}), 500


@app.route('/api/csv-test', methods=['POST'])
def post_server_data():
    try:
        # Parse the incoming JSON data returning from the front end
        data = request.get_json()
        # Save columns & rows from incoming json to local var
        columns = data.get('columns', [])
        rows = data.get('data', [])
        # Convert the received data back into a DataFrame
        df = pd.DataFrame(rows, columns=columns)
        # Re-save as csv with updated data from client
        df.to_csv('test.csv', index=False)  # Save back to CSV
        # Send success response (HTML Code 200)
        return jsonify({"message": "CSV data successfully updated"}), 200
    # Send error if the returned json fails to be processed by server
    except Exception as e:
        return jsonify({"error": f"Error processing the data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
