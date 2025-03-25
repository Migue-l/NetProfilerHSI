import os
import csv
from datetime import datetime

class CardEntryManager:
    """
    Card Entry Manager Class
    For displaying, creating, and managing cards and decks.
    """
    def __init__(self, prefix="Net-"):
        self.prefix = prefix
        self.selected_directory = None

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
                clean_name = item[len(self.prefix):]
                if os.path.isdir(item_path):
                    result[clean_name] = {
                        "type": "Deck",
                        "contents": self.list_matching_files_and_folders(item_path)
                    }
                else:
                    card_details = self._read_card_details(item_path)
                    result[clean_name] = card_details
        return result

    def _read_card_details(self, file_path):
        """Helper to read card details from CSV file"""
        details = {"type": "Card", "title": "", "subcategories": {}}
        try:
            with open(file_path, mode='r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                if rows:
                    details["title"] = rows[0].get("Title", "")
                    for row in rows:
                        if all(key in row for key in ["Category", "Subcategory", "Value"]):
                            category = row["Category"]
                            subcategory = row["Subcategory"]
                            value = row["Value"]
                            details["subcategories"].setdefault(category, {})[subcategory] = value
        except Exception as e:
            print(f"Error reading CSV file {file_path}: {e}")
        return details

    def list_decks(self, directory=None):
        """Recursively lists all deck locations"""
        directory = directory or self.selected_directory
        if not directory:
            return []

        decks = []
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            if item.startswith(self.prefix) and os.path.isdir(item_path):
                decks.append(os.path.relpath(item_path, self.selected_directory))
                decks.extend(self.list_decks(item_path))
        return decks

    def create_card(self, card_name, location, created_at, title="", subcategories=None):
        """Creates a new card with optional subcategories"""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        os.makedirs(save_path, exist_ok=True)
        
        file_path = os.path.join(save_path, f"{card_name}.csv")
        rows = self._prepare_card_rows(card_name, created_at, title, subcategories)
        
        self._write_card_file(file_path, rows)
        
        return {
            "message": "Card created successfully",
            "cardName": card_name,
            "filePath": file_path,
            "data": self._flatten_rows(rows),
            "subcategories": subcategories or {}
        }

    def _prepare_card_rows(self, card_name, created_at, title, subcategories):
        """Prepares rows for card CSV"""
        rows = []
        if subcategories:
            for category, fields in subcategories.items():
                for subcat, value in fields.items():
                    rows.append({
                        "Card Name": card_name,
                        "Created At": created_at,
                        "Title": title,
                        "Category": category,
                        "Subcategory": subcat,
                        "Value": value
                    })
        else:
            rows.append({
                "Card Name": card_name,
                "Created At": created_at,
                "Title": title,
                "Category": "",
                "Subcategory": "",
                "Value": ""
            })
        return rows

    def _write_card_file(self, file_path, rows):
        """Writes card data to CSV file"""
        with open(file_path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=[
                "Card Name", "Created At", "Title", 
                "Category", "Subcategory", "Value"
            ])
            writer.writeheader()
            writer.writerows(rows)

    def _flatten_rows(self, rows):
        """Helper to flatten rows for API response"""
        return {k: v for row in rows for k, v in row.items()}

    def update_card_subcategories(self, card_name, subcat_data):
        """Updates an existing card's subcategory values"""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        file_path = os.path.join(self.selected_directory, f"{card_name}.csv")
        if not os.path.exists(file_path):
            return {"error": "Card file not found"}

        # Read existing metadata
        with open(file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            existing_rows = list(reader)
            if not existing_rows:
                return {"error": "No existing data found"}

        # Write updated data
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "Created At", "Title", "Category", "Subcategory", "Value"])
            for category, subcat_dict in subcat_data.items():
                for subcat, value in subcat_dict.items():
                    writer.writerow([
                        existing_rows[0]["Card Name"],
                        existing_rows[0]["Created At"],
                        existing_rows[0]["Title"],
                        category,
                        subcat,
                        value
                    ])

        return {
            "message": "Subcategories updated successfully",
            "updatedData": subcat_data
        }

    def create_deck(self, deck_name, location):
        """Creates a new deck (folder)"""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        deck_path = os.path.join(save_path, deck_name)

        if os.path.exists(deck_path):
            return {"error": "Deck already exists"}

        os.makedirs(deck_path, exist_ok=True)
        return {
            "message": "Deck created successfully",
            "deckName": deck_name,
            "filePath": deck_path
        }