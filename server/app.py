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
    

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            print("DEBUG: No file found in request")
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            print("DEBUG: Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"DEBUG: Recieved file- {file.filename}")

        # Define path for test.csv
        csv_file_path = os.path.join(os.path.dirname(__file__), "test.csv")

        # Read existing CSV or create an empty DataFrame if not present
        if os.path.exists(csv_file_path):
            existing_data = pd.read_csv(csv_file_path, dtype=str)
        else:
            existing_data = pd.DataFrame()

        # Read uploaded CSV
        new_data = pd.read_csv(file, dtype=str)

        existing_columns = [col.strip().lower() for col in existing_data.columns]
        new_columns = [col.strip() for col in new_data.columns]

        print("DEBUG: Existing columns:", existing_columns)
        print("DEBUG: Uploaded columns:", new_columns)

        if set(existing_columns) != set(new_columns):
            missing = set(existing_columns) - set(new_columns)
            extra = set(new_columns) - set(existing_columns)
            return jsonify({'error': 'Uploaded CSV does not match the required format', 
                    'missing_columns': list(missing), 
                    'extra_columns': list(extra)}), 400

        # Append new data
        combined_data = pd.concat([existing_data, new_data], ignore_index=True)

        combined_data = combined_data.map(lambda x: None if isinstance(x, float) and np.isnan(x) else x)

        combined_data.to_csv(csv_file_path, index=False)  # Save back to test.csv

        # Return updated data
        return jsonify({
            'message': 'CSV uploaded successfully',
            'updated_data': combined_data.to_dict(orient="records")
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/get-csv-data', methods=['GET'])
def get_csv_data():
    """Reads test.csv and returns the Name column for display."""
    try:
        csv_file_path = os.path.join(os.path.dirname(__file__), "test.csv")

        if not os.path.exists(csv_file_path):
            return jsonify({"error": "No data available"}), 400

        # Read the CSV file as a DataFrame
        df = pd.read_csv(csv_file_path, dtype=str)

        # Ensure "Name" column exists
        if "Name" not in df.columns:
            return jsonify({"error": "CSV file does not contain 'Name' column"}), 400

        names_list = df["Name"].dropna().tolist()

        return jsonify({"names": names_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
