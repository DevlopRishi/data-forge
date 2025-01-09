import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import csv
from tkinter import Tk, Label, Entry, Button, Text, Scrollbar, StringVar, END, Frame, filedialog

def scrape_website(url, output_dir):
    """Scrapes the entire website and extracts structured data."""
    visited = set()
    extracted_data = []

    def scrape_page(url):
        if url in visited:
            return
        visited.add(url)

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")

            # Extract structured data
            page_data = {
                "url": url,
                "title": soup.title.string if soup.title else "",
                "headers": [header.get_text(strip=True) for header in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])],
                "paragraphs": [p.get_text(strip=True) for p in soup.find_all("p")],
                "links": [urljoin(url, link["href"]) for link in soup.find_all("a", href=True)],
                "images": [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]
            }
            extracted_data.append(page_data)

            # Save images
            image_dir = os.path.join(output_dir, "images")
            os.makedirs(image_dir, exist_ok=True)
            for img_url in page_data["images"]:
                download_image(img_url, image_dir)

            # Recursively scrape links
            for link in page_data["links"]:
                if link.startswith(url):  # Stay within the domain
                    scrape_page(link)

        except Exception as e:
            log_message(f"Error scraping {url}: {str(e)}")

    scrape_page(url)

    # Save structured data
    save_data_as_json(extracted_data, os.path.join(output_dir, "data.json"))
    save_data_as_csv(extracted_data, os.path.join(output_dir, "data.csv"))
    log_message("Data extraction completed and saved as JSON and CSV.")

def download_image(url, output_dir):
    """Downloads an image from a given URL."""
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        image_name = url.split("/")[-1]
        image_path = os.path.join(output_dir, image_name)
        with open(image_path, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        log_message(f"Image saved: {image_name}")
    except Exception as e:
        log_message(f"Error downloading image {url}: {str(e)}")

def save_data_as_json(data, filepath):
    """Saves the data as a JSON file."""
    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
    log_message(f"Data saved as JSON: {filepath}")

def save_data_as_csv(data, filepath):
    """Saves the data as a CSV file."""
    keys = ["url", "title", "headers", "paragraphs", "links", "images"]
    with open(filepath, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=keys)
        writer.writeheader()
        for entry in data:
            writer.writerow({key: json.dumps(entry[key]) for key in keys})
    log_message(f"Data saved as CSV: {filepath}")

def log_message(message):
    """Logs a message to the output console."""
    output_text.insert(END, f"{message}\n")
    output_text.see(END)

def select_folder():
    """Opens a dialog to select the output folder."""
    folder = filedialog.askdirectory()
    if folder:
        folder_var.set(folder)

def start_scraping():
    """Starts the scraping process."""
    url = url_var.get()
    output_dir = folder_var.get()
    if not url:
        log_message("Please enter a URL.")
        return
    if not output_dir:
        log_message("Please select a folder to save the files.")
        return

    log_message(f"Starting to scrape: {url}")
    scrape_website(url, output_dir)
    log_message("Scraping completed. Files saved in the selected folder.")

# Create the main application window
root = Tk()
root.title("Web Scraper for AI Training")
root.geometry("800x600")
root.configure(bg="#1e1e1e")

# URL Entry Section
url_var = StringVar()
url_label = Label(root, text="Website URL:", font=("Arial", 12), fg="white", bg="#1e1e1e")
url_label.pack(pady=10)
url_entry = Entry(root, textvariable=url_var, font=("Arial", 12), width=60, bg="#2d2d2d", fg="white", insertbackground="white")
url_entry.pack(pady=5)

# Folder Selection Section
folder_var = StringVar()
folder_label = Label(root, text="Save Files To:", font=("Arial", 12), fg="white", bg="#1e1e1e")
folder_label.pack(pady=10)
folder_frame = Frame(root, bg="#1e1e1e")
folder_frame.pack(pady=5)

folder_entry = Entry(folder_frame, textvariable=folder_var, font=("Arial", 12), width=50, bg="#2d2d2d", fg="white", insertbackground="white")
folder_entry.pack(side="left", padx=5)
folder_button = Button(folder_frame, text="Browse", command=select_folder, font=("Arial", 10), bg="#444444", fg="white", activebackground="#555555", activeforeground="white")
folder_button.pack(side="left")

# Scrape Button
scrape_button = Button(root, text="Start Scraping", command=start_scraping, font=("Arial", 12), bg="#444444", fg="white", activebackground="#555555", activeforeground="white")
scrape_button.pack(pady=10)

# Output Console
output_label = Label(root, text="Output Log:", font=("Arial", 12), fg="white", bg="#1e1e1e")
output_label.pack(pady=10)

# Create a frame for the text widget and scrollbar
output_frame = Frame(root, bg="#1e1e1e")
output_frame.pack(padx=10, pady=5, fill="both", expand=True)

output_text = Text(output_frame, wrap="word", font=("Courier", 10), bg="#2d2d2d", fg="white", insertbackground="white", height=20)
output_text.pack(side="left", fill="both", expand=True)

scrollbar = Scrollbar(output_frame, command=output_text.yview, bg="#2d2d2d")
scrollbar.pack(side="right", fill="y")
output_text.config(yscrollcommand=scrollbar.set)

# Run the GUI
root.mainloop()