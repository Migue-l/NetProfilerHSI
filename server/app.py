from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
#from waitress import serve

# Create 'main' app obj
app = Flask(__name__)
# Enable Flask debug mode
app.config['DEBUG'] = True
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

@app.route('/api/csv-test', methods=['GET'])
def get_csv_data():
    try:
        # Check if Flask receives request from front-end
        print("Received request for /api/csv-test")

        # Check if file exists before reading
        if not os.path.exists('test.csv'):
            print("Error: test.csv file not found.")
            return jsonify({"Read Error": "File test.csv not found"}), 500
        
        # Check if Python has permission to read test csv
        if not os.access('test.csv', os.R_OK):
            print("Error: Flask does not have permission to read test.csv.")
            return jsonify({"Read Error": "Python lacks read permissions for test.csv"}), 500
        
        print("Success: Flask can read the file.")
        
        df = pd.read_csv('test.csv')
        # Debug code: Print CSV contents to verify read
        print("CSV successfully read. First few rows:")
        print(df.head())

        # Convert DataFrame to more JSON-friendly dict
        data = {
            # list() converts column indexes into python list
            "columns" : list(df.columns),
            # to_list() converts numpy arr into list of lists
            "data" : df.values.tolist()
        }
        # Send json response to the front-end
        return jsonify(data)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        # Code 500 is an HTML server error 
        return jsonify({"Server Error": f"Failed to read CSV file: {str(e)}"}), 500


@app.route('/api/csv-test', methods=['POST'])
def post_csv_data():
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
        return jsonify({"Server Error": f"Error processing the data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
