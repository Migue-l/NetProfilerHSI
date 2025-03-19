import json
import os
import csv
import sys
import subprocess

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
                    # It's a file. Assume it's a card CSV.
                    card_details = {"type": "Card", "title": ""}
                    try:
                        with open(item_path, mode='r', newline='', encoding='utf-8') as f:
                            reader = csv.DictReader(f)
                            rows = list(reader)
                            if rows:
                                # Expecting columns: "Card Name", "Created At", "Title"
                                card_details["title"] = rows[0].get("Title", "")
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

    def create_card(self, card_name, location, created_at, title=""):
        """Creates a new card as a CSV file inside the selected deck or root directory."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        sanitized_name = card_name.replace(" ", "_")
        file_path = os.path.join(save_path, f"{sanitized_name}.csv")

        os.makedirs(save_path, exist_ok=True)

        # Write the card data to CSV, including the Title
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "Created At", "Title"])
            writer.writerow([card_name, created_at, title])

        return {
            "message": "Card created successfully",
            "cardName": card_name,
            "createdAt": created_at,
            "title": title,
            "filePath": file_path
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

        return {
            "message": "Deck created successfully",
            "deckName": deck_name,
            "filePath": deck_path
        }

# Example Usage
if __name__ == "__main__":
    root_directory = "../DevDatabase"  # Change this to your actual directory
    scanner = CardEntryManager(root_directory)
