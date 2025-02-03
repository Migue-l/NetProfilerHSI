import numpy as np
import os
import threading
import csv
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import tkinter as tk
from tkinter import filedialog
#from waitress import serve
from CardEntryManager.cardEntryManager import CardEntryManager

# Create 'main' app obj
app = Flask(__name__)
# Enable Flask debug mode
app.config['DEBUG'] = True
CORS(app)
CardEntryManager = CardEntryManager()
selected_directory = None  # Global variable for selected root directory


def select_directory_dialog(result_container):
    """Opens a file explorer window for directory selection."""
    global CardEntryManager
    global selected_directory
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)

    directory = filedialog.askdirectory()
    selected_directory = directory
    if directory and CardEntryManager.set_selected_directory(directory):
        result_container["directory"] = directory
        result_container["decks"] = CardEntryManager.list_decks()
        result_container["entries"] = CardEntryManager.list_matching_files_and_folders(directory)  # Include all entries
    else:
        result_container["directory"] = None
        result_container["decks"] = []
        result_container["entries"] = {}

    root.destroy()

@app.route('/api/select-directory', methods=['POST'])
def select_directory():
    """Handles directory selection and returns its contents."""
    try:
        result_container = {"directory": None, "decks": None, "entries": None}
        thread = threading.Thread(target=select_directory_dialog, args=(result_container,))
        thread.start()
        thread.join()

        if not result_container["directory"]:
            return jsonify({"error": "No directory selected"}), 400

        return jsonify({
            "directory": result_container["directory"],
            "decks": result_container["decks"],
            "entries": result_container["entries"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/refresh-directory', methods=['POST'])
def refresh_directory():
    try:
        global selected_directory
        if not selected_directory:
            return jsonify({"error": "No directory selected to refresh"}), 400

        refreshed_entries = CardEntryManager.list_matching_files_and_folders(selected_directory)
        return jsonify({"directory": selected_directory, "entries": refreshed_entries}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/new-card', methods=['POST'])
def newCard():
    """Creates a new card, allowing it to be placed in a deck or the root directory."""
    try:
        data = request.get_json()
        card_name = data.get('cardName', 'Unnamed_Card')
        location = data.get('location', None)  # Allow None for root directory
        created_at = data.get('createdAt', 'Unknown Time')

        result = CardEntryManager.create_card(card_name, location, created_at)
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/new-deck', methods=['POST'])
def newDeck():
    """Creates a new deck, allowing it to be placed in another deck or root directory."""
    try:
        data = request.get_json()
        deck_name = data.get('deckName', 'Unnamed_Deck')
        location = data.get('location', None)  # Allow None for root directory

        result = CardEntryManager.create_deck(deck_name, location)
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/api/csv-test', methods=['GET'])
# def get_csv_data():
#     try:
#         # Check if Flask receives request from front-end
#         print("Received request for /api/csv-test")
#
#         # Check if file exists before reading
#         if not os.path.exists('test.csv'):
#             print("Error: test.csv file not found.")
#             return jsonify({"Read Error": "File test.csv not found"}), 500
#
#         # Check if Python has permission to read test csv
#         if not os.access('test.csv', os.R_OK):
#             print("Error: Flask does not have permission to read test.csv.")
#             return jsonify({"Read Error": "Python lacks read permissions for test.csv"}), 500
#
#         print("Success: Flask can read the file.")
#
#         df = pd.read_csv('test.csv')
#         # Debug code: Print CSV contents to verify read
#         print("CSV successfully read. First few rows:")
#         print(df.head())
#
#         # Convert DataFrame to more JSON-friendly dict
#         data = {
#             # list() converts column indexes into python list
#             "columns" : list(df.columns),
#             # to_list() converts numpy arr into list of lists
#             "data" : df.values.tolist()
#         }
#         # Send json response to the front-end
#         return jsonify(data)
#     except Exception as e:
#         print(f"Error reading CSV: {e}")
#         # Code 500 is an HTML server error
#         return jsonify({"Server Error": f"Failed to read CSV file: {str(e)}"}), 500
#
#
# @app.route('/api/csv-test', methods=['POST'])
# def post_csv_data():
#     try:
#         # Parse the incoming JSON data returning from the front end
#         data = request.get_json()
#         # Save columns & rows from incoming json to local var
#         columns = data.get('columns', [])
#         rows = data.get('data', [])
#         # Convert the received data back into a DataFrame
#         df = pd.DataFrame(rows, columns=columns)
#         # Re-save as csv with updated data from client
#         df.to_csv('test.csv', index=False)  # Save back to CSV
#         # Send success response (HTML Code 200)
#         return jsonify({"message": "CSV data successfully updated"}), 200
#     # Send error if the returned json fails to be processed by server
#     except Exception as e:
#         return jsonify({"Server Error": f"Error processing the data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
