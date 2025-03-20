import json
import os
import csv
import sys
import subprocess
from flask import Flask

app = Flask(__name__)

class CardEntryManager:
    """
    Card Entry Manager Class

    For displaying, creating, and managing cards and decks.
    """
    def __init__(self, prefix="Net-"):
        self.prefix = prefix
        self.selected_directory = None  # Stores the currently selected directory

    def set_selected_directory(self, directory):
        """Sets the root directory for deck and card management."""
        if os.path.isdir(directory):
            self.selected_directory = directory
            return True
        return False

    def list_matching_files_and_folders(self, directory):
        result = {}

        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            if item.startswith(self.prefix):
                clean_name = item[len(self.prefix):]  # Remove the prefix

                if os.path.isdir(item_path):
                    result[clean_name] = {
                        "type": "Deck",
                        "contents": self.list_matching_files_and_folders(item_path)
                    }
                else:
                    
                    card_details = {"type": "Card", "title": "", "subcategories": {}}
                    try:
                        with open(item_path, mode='r', newline='', encoding='utf-8') as f:
                            reader = csv.DictReader(f)
                            rows = list(reader)
                            if rows:
                                card_details["title"] = rows[0].get("Title", "")

                                # Read and store subcategories
                                for row in rows:
                                    if "Category" in row and "Subcategory" in row and "Value" in row:
                                        category = row["Category"]
                                        subcategory = row["Subcategory"]
                                        value = row["Value"]
                                        if category not in card_details["subcategories"]:
                                            card_details["subcategories"][category] = {}
                                        card_details["subcategories"][category][subcategory] = value
                    except Exception as e:
                        print(f"Error reading CSV file {item_path}: {e}")

                    result[clean_name] = card_details

        return result

    def list_decks(self, directory=None):
        """Recursively lists all deck locations that start with the prefix."""
        if directory is None:
            directory = self.selected_directory

        if not directory:
            return []

        decks = []

        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            if item.startswith(self.prefix) and os.path.isdir(item_path):
                decks.append(os.path.relpath(item_path, self.selected_directory))
                decks.extend(self.list_decks(item_path))

        return decks

    def create_card(self, card_name, location, created_at, title="",subcategories=None):
        """Creates a new card as a CSV file inside the selected deck or root directory."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        sanitized_name = card_name.replace(" ", "_")
        file_path = os.path.join(save_path, f"{sanitized_name}.csv")

        os.makedirs(save_path, exist_ok=True)

     
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "Created At", "Title", "Category", "Subcategory", "Value"])

            if subcategories:
                for category, subcat_dict in subcategories.items():
                    for subcat, value in subcat_dict.items():
                        writer.writerow([card_name, created_at, title, category, subcat, value])
            else:
                writer.writerow([card_name, created_at, title, "", "", ""])

        return {
            "message": "Card created successfully",
            "cardName": card_name,
            "createdAt": created_at,
            "title": title,
            "filePath": file_path
        }
    
    def update_card_subcategories(self, card_name, subcat_data):
        """Updates an existing card's subcategory values."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        file_path = os.path.join(self.selected_directory, f"{card_name}.csv")
        if not os.path.exists(file_path):
            return {"error": "Card file not found"}

        # Read existing data
        with open(file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            existing_rows = list(reader)
            if not existing_rows or "Card Name" not in existing_rows[0]:
                return {"error": "No valid existing data found"}

        
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "Created At", "Title", "Category", "Subcategory", "Value"])

            
            if existing_rows:
                card_name = existing_rows[0]["Card Name"]
                created_at = existing_rows[0]["Created At"]
                title = existing_rows[0]["Title"]
            else:
                return {"error": "No existing data found"}

            
            for category, subcat_dict in subcat_data.items():
                for subcat, value in subcat_dict.items():
                    writer.writerow([card_name, created_at, title, category, subcat, value])

        return {
            "message": "Subcategories updated successfully",
            "updatedData": subcat_data
        }

    def create_deck(self, deck_name, location):
        """Creates a new deck (folder) inside the selected directory or another deck."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        deck_path = os.path.join(save_path, f"{deck_name}")

        if os.path.exists(deck_path):
            return {"error": "Deck already exists"}

        os.makedirs(deck_path, exist_ok=True)
        if subcategories is None:
            subcategories = {}
        

        return {
            "message": "Deck created successfully",
            "deckName": deck_name,
            "filePath": deck_path
        }


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
   # root_directory = "../DevDatabase"  # Change this to your actual directory
   # scanner = CardEntryManager(root_directory)
