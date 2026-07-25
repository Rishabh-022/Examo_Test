import os
import zipfile
import re
import shutil

raw_dir = r"C:\Users\ss v\Desktop\exam\backend\ai-service\Raw_Zips"
output_dir = r"C:\Users\ss v\Desktop\exam\backend\ai-service\pdfs"

os.makedirs(output_dir, exist_ok=True)
print("🚀 Starting Deep-Search PDF Extraction...\n")

zip_files = [f for f in os.listdir(raw_dir) if f.endswith('.zip')]

if not zip_files:
    print("❌ No ZIP files found in Raw_Zips!")
else:
    for zip_file in zip_files:
        folder_name = zip_file.replace('.zip', '')
        target_folder = os.path.join(output_dir, folder_name)
        zip_path = os.path.join(raw_dir, zip_file)
        
        os.makedirs(target_folder, exist_ok=True)
        print(f"📦 Processing: {folder_name}...")
        
        # 1. Extract everything (including those annoying subfolders)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_folder)
            
        # 2. Walk through EVERY subfolder recursively
        for root, dirs, files in os.walk(target_folder, topdown=False):
            for filename in files:
                old_path = os.path.join(root, filename)
                
                # If it's a PDF, rename it and move it to the main target_folder
                if filename.lower().endswith(".pdf"):
                    match = re.search(r'(\d{2})\.pdf$', filename.lower())
                    if match:
                        chapter_num = int(match.group(1))
                        new_name = f"Chapter_{chapter_num}.pdf"
                        new_path = os.path.join(target_folder, new_name)
                        
                        # Move it out of the subfolder and rename it
                        shutil.move(old_path, new_path)
                    else:
                        # Delete junk PDFs (answers, prelims)
                        os.remove(old_path)
                else:
                    # Delete non-PDFs (like .png images)
                    os.remove(old_path)
            
            # 3. Delete the empty subfolders now that we took the PDFs out
            if root != target_folder:
                try:
                    os.rmdir(root)
                except Exception:
                    pass
        
        print(f"✅ {folder_name} fully extracted and renamed!\n")

print("🎉 ALL ZIP FILES PROCESSED PERFECTLY!")