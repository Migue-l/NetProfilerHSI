import json
import os
import sys
import subprocess

class CardEntryManager:
    """
            Card Entry Manager Class

            For displaying, creating, and managing cards and decks

    """

    def __init__(self, root_dir, prefix="Net-"):
        self.root_dir = root_dir
        self.prefix = prefix

    def list_matching_files_and_folders(self, directory=None):
        if directory is None:
            directory = self.root_dir

        result = {}

        # Walk through the specified directory
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            # Check if item starts with the prefix
            if item.startswith(self.prefix):
                if os.path.isdir(item_path):
                    # Assign a dictionary to represent a "Card Deck" and store its contents
                    result[item] = {
                        "type": "Card Deck",
                        "contents": self.list_matching_files_and_folders(item_path)
                    }
                else:
                    # Assign "Card Entry" to files
                    result[item] = {"type": "Card Entry"}

        return result

    def print_results(self):
        matching_files_and_folders = self.list_matching_files_and_folders()
        print(json.dumps(matching_files_and_folders, indent=2))

# Example Usage
if __name__ == "__main__":
    root_directory = "../DevDatabase"  # Change this to the actual directory
    scanner = CardEntryManager(root_directory)
    scanner.print_results()

