﻿import os
import threading
import csv
import json
import tkinter as tk
from tkinter import filedialog
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from CardEntryManager.cardEntryManager import CardEntryManager

from flask_cors import CORS

app = Flask(__name__)

EXPECTED_COLUMNS = [
    "name", "alias", "dob", "ssn", "race", "gender", "driver license #",
    "passport coc", "weight", "height", "hair color", "eye color", "last known residence", 
    "cob", "employment", "phone #", "email address", "date sar checked", "immigration status",
    "sid #", "travel", "make", "model", "vehicle tag #", "color", "social media", "associated business", 
    "suspected role", "fbi #", "active warrants", "criminal history", "sar activity", "case #", "roa #"
]

csv_file_path = os.path.join(os.path.dirname(__file__), "test.csv")

# Enable Flask debug mode
app.config['DEBUG'] = True
CORS(app)

# Configure CORS more specifically
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],  # Your Vite frontend
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
card_manager = CardEntryManager()
selected_directory = None

def select_directory_dialog(result_container):
    global card_manager, selected_directory
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)
    directory = filedialog.askdirectory()
    selected_directory = directory
    if directory and card_manager.set_selected_directory(directory):
        result_container["directory"] = directory
        result_container["decks"] = card_manager.list_decks()
        result_container["entries"] = card_manager.list_matching_files_and_folders(directory)
    else:
        result_container["directory"] = None
        result_container["decks"] = []
        result_container["entries"] = {}
    root.destroy()

@app.route('/api/select-directory', methods=['POST'])
def select_directory():
    try:
        result_container = {"directory": None, "decks": None, "entries": None}
        thread = threading.Thread(target=select_directory_dialog, args=(result_container,))
        thread.start()
        thread.join()

        if not result_container["directory"]:
            return jsonify({"error": "No directory selected"}), 400

        return jsonify(result_container), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/refresh-directory', methods=['POST'])
def refresh_directory():
    try:
        global selected_directory
        if not selected_directory:
            return jsonify({"error": "No directory selected to refresh"}), 400

        refreshed_entries = card_manager.list_matching_files_and_folders(selected_directory)
        return jsonify({"directory": selected_directory, "entries": refreshed_entries}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/new-card', methods=['POST'])
def newCard():
    try:
        data = request.get_json()
        card_name = data.get('cardName', 'Unnamed_Card')
        location = data.get('location', None)
        created_at = data.get('createdAt', 'Unknown Time')
        title = data.get('title', "")
        csv_data = data.get('csvData', None)  # optional

        # 🧠 Default values if no CSV selected
        full_data = {}

        if csv_data:  # Only search test.csv if a name is provided
            df = pd.read_csv(csv_file_path, dtype=str)
            matched_row = df[df["Name"].str.strip().str.lower() == str(csv_data).strip().lower()]
            if matched_row.empty:
                return jsonify({"error": f"No CSV match found for: {csv_data}"}), 404

            full_data = matched_row.iloc[0].to_dict()

            def safe_strip(val):
                return str(val).strip() if val is not None else ""

            full_data = {str(k).strip().lower(): safe_strip(v) for k, v in full_data.items()}

            print("✅ Returning subcatValues:", full_data)

        # 🧱 Card is created either way
        result = card_manager.create_card(
            card_name,
            location,
            created_at,
            title=title,
            csv_data=csv_data
        )

        if "error" in result:
            return jsonify(result), 400

        return jsonify({
            "filePath": result.get("filePath", ""),
            "subcatValues": full_data
        }), 201

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

        # Read existing CSV or create an empty DataFrame if not present
        file_exists = os.path.exists(csv_file_path)
        if file_exists:
            existing_data = pd.read_csv(csv_file_path, dtype=str)
        else:
            existing_data = pd.DataFrame(columns=EXPECTED_COLUMNS)

        # Read uploaded CSV
        new_data = pd.read_csv(file, dtype=str)

         # Clean the data: Strip whitespace/tab from both columns and data
        new_data.columns = [col.strip().lower() for col in new_data.columns]

        new_data = new_data.reindex(columns=EXPECTED_COLUMNS)  # Reorder columns
        new_data = new_data.fillna("N/A")  # Fill missing values

        new_data = new_data[[col for col in EXPECTED_COLUMNS if col in new_data.columns]]

        missing_cols = [col for col in EXPECTED_COLUMNS if col not in new_data.columns]
        if missing_cols:
            return jsonify({'error': 'Uploaded CSV is missing required columns', 'missing_columns': missing_cols}), 400
        
        new_data = new_data[EXPECTED_COLUMNS]

        # Append new data
        with open(csv_file_path, 'a', newline='') as f:
            if file_exists:
                f.write("\n")
            new_data.to_csv(f, index=False, header=not file_exists, lineterminator="\n")  # Save back to test.csv

        # Return updated data
        return jsonify({
            'message': 'CSV uploaded successfully',
            'updated_data': new_data.fillna("").to_dict(orient="records")
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get-csv-data', methods=['GET'])
def get_csv_data():
    try:
        csv_file_path = os.path.join(os.path.dirname(__file__), "test.csv")
        if not os.path.exists(csv_file_path):
            return jsonify({"error": "No data available"}), 400

        df = pd.read_csv(csv_file_path, dtype=str)
        df = df.drop_duplicates()  # Add this line to remove duplicates


        if "Name" not in df.columns:
            return jsonify({"error": "CSV file does not contain 'Name' column"}), 400

        names_list = df["Name"].dropna().tolist()

        return jsonify({"names": names_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)