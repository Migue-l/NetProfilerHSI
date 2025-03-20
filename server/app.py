import os
import threading
import csv
import json
import tkinter as tk
from tkinter import filedialog
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from CardEntryManager.cardEntryManager import CardEntryManager

app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app)


card_manager = CardEntryManager()
selected_directory = None  # Global variable for selected root directory

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

        result = card_manager.create_card(card_name, location, created_at, title=title)
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/new-deck', methods=['POST'])
def newDeck():
    try:
        data = request.get_json()
        deck_name = data.get('deckName', 'Unnamed_Deck')
        location = data.get('location', None)

        result = card_manager.create_deck(deck_name, location)
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        csv_file_path = os.path.join(os.path.dirname(__file__), "test.csv")
        print("CSV file path:", csv_file_path)

        if os.path.exists(csv_file_path):
            existing_data = pd.read_csv(csv_file_path, dtype=str)
        else:
            existing_data = pd.DataFrame()

        new_data = pd.read_csv(file, dtype=str)

        if not existing_data.empty and list(existing_data.columns) != list(new_data.columns):
            return jsonify({'error': 'Uploaded CSV does not match the required format'}), 400

        combined_data = pd.concat([existing_data, new_data], ignore_index=True)
        combined_data.to_csv(csv_file_path, index=False)

        return jsonify({
            'message': 'CSV uploaded successfully',
            'file_path': csv_file_path,
            'updated_data': combined_data.to_dict(orient="records")
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

        if "Name" not in df.columns:
            return jsonify({"error": f"Expected 'Name' column but found: {df.columns.tolist()}"}), 400

        return jsonify({"names": df["Name"].tolist()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-card-subcat', methods=['POST'])
def update_card_subcat():
    try:
        data = request.get_json()
        cardName = data.get('cardName')
        subcatData = data.get('subcatData')
        
        if not cardName:
            return jsonify({"error": "cardName is required"}), 400
        if not subcatData:
            return jsonify({"error": "subcatData is required"}), 400

        result = card_manager.update_card_subcategories(cardName, subcatData)
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
