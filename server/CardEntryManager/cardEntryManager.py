import json
import os
import sys
import subprocess



class CardEntryManager:
    """
            Card Entry Manager Class

            For displaying, creating, and managing cards and decks

    """

    def __init__(self, prefix="Net-"):
        self.prefix = prefix



    def list_matching_files_and_folders(self, directory):

        result = {}

        # Walk through the specified directory
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)

            # Check if item starts with the prefix
            if item.startswith(self.prefix):
                clean_name = item[len(self.prefix):]  # Remove the prefix from the name

                if os.path.isdir(item_path):
                    # Assign a dictionary to represent a "Card Deck" and store its contents
                    result[clean_name] = {
                        "type": "Deck",
                        "contents": self.list_matching_files_and_folders(item_path)
                    }
                else:
                    # Assign "Card Entry" to files
                    result[clean_name] = {"type": "Card"}

        return result



# Example Usage
if __name__ == "__main__":
    root_directory = "../DevDatabase"  # Change this to the actual directory
    scanner = CardEntryManager(root_directory)

