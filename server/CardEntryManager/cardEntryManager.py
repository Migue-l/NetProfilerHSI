import json
import os
import csv
import sys
import subprocess



class CardEntryManager:
    """
            Card Entry Manager Class

            For displaying, creating, and managing cards and decks

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

    # decks as different objects
    def list_matching_files_and_folders(self, directory):

        result = {}

        # Walk through the specified directory
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            # Check if item starts with the prefix
            if item.startswith(self.prefix):
                clean_name = item[len(self.prefix):]  # Remove the prefix from the name

                # if the path is a directory with the desired prefix, make it into an object type of Deck with content attribute
                # Assign "Deck" to Folder
                if os.path.isdir(item_path):
                    # Assign a dictionary to represent a "Card Deck" and store its contents
                    result[clean_name] = {
                        "type": "Deck",
                        "contents": self.list_matching_files_and_folders(item_path)
                    }
                else:
                    # Assign "Card" to files
                    result[clean_name] = {
                        "type": "Card"}


        return result


    def list_decks(self, directory=None):
        """Recursively lists all deck locations that start with the prefix."""
        if directory is None:
            directory = self.selected_directory  # Start from root if no directory is specified

        if not directory:
            return []

        decks = []

        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            # Check if item is a deck (folder starting with the prefix)
            if item.startswith(self.prefix) and os.path.isdir(item_path):
                decks.append(os.path.relpath(item_path, self.selected_directory))  # Store relative path
                decks.extend(self.list_decks(item_path))  # Recursively search within

        return decks


    def create_card(self, card_name, location, created_at):
        """Creates a new card as a CSV file inside the selected deck or root directory."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        # Determine save location (deck or root)
        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        sanitized_name = card_name.replace(" ", "_")
        file_path = os.path.join(save_path, f"{sanitized_name}.csv")

        os.makedirs(save_path, exist_ok=True)  # Ensure directory exists

        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Card Name", "Created At"])
            writer.writerow([card_name, created_at])

        return {
            "message": "Card created successfully",
            "cardName": card_name,
            "createdAt": created_at,
            "filePath": file_path
        }


    def create_deck(self, deck_name, location):
        """Creates a new deck (folder) inside the selected directory or another deck."""
        if not self.selected_directory:
            return {"error": "No directory selected"}

        # Determine the save path (root or inside another deck)
        save_path = os.path.join(self.selected_directory, location) if location else self.selected_directory
        deck_path = os.path.join(save_path, f"{deck_name}")  # Ensure deck uses prefix

        if os.path.exists(deck_path):
            return {"error": "Deck already exists"}

        os.makedirs(deck_path, exist_ok=True)  # Create the new deck

        return {
            "message": "Deck created successfully",
            "deckName": deck_name,
            "filePath": deck_path
        }


# Example Usage
if __name__ == "__main__":
    root_directory = "../DevDatabase"  # Change this to the actual directory
    scanner = CardEntryManager(root_directory)

