import os
import requests
from bs4 import BeautifulSoup
import shutil

def download_and_package_icse(target_url, board, class_level, subject):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    # This matches your exact database and directory pattern
    folder_name = f"{board}_{class_level}_{subject}"
    raw_zips_dir = "Raw_Zips"
    
    os.makedirs(raw_zips_dir, exist_ok=True)
    os.makedirs(folder_name, exist_ok=True)
    
    print(f"📡 Fetching chapter table from Jagran Josh: {target_url}")
    response = requests.get(target_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    table = soup.find('table')
    if not table:
        print("❌ Could not find a table on this page. Make sure you use a Jagran Josh page with a chapter table!")
        shutil.rmtree(folder_name)
        return

    rows = table.find_all('tr')[1:] 
    
    for row in rows:
        a_tag = row.find('a')
        if not a_tag:
            continue # Skips table header or unit titles without links
            
        download_link = a_tag.get('href')
        cols = row.find_all('td')
        
        if download_link and download_link.startswith('http') and len(cols) >= 2:
            if len(cols) >= 3:
                chapter_num = cols[0].text.strip()
                chapter_name = cols[1].text.strip()
            else:
                chapter_num = "0"
                chapter_name = cols[0].text.strip()
            
            # Clean up chapter names so Windows file system doesn't throw errors
            safe_name = "".join(c for c in chapter_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
            if not chapter_num: chapter_num = "0"
                
            filename = f"Chapter_{chapter_num}_{safe_name}.pdf"
            filepath = os.path.join(folder_name, filename)
            
            print(f"📥 Downloading: {filename}...")
            try:
                file_res = requests.get(download_link, headers=headers, timeout=15)
                with open(filepath, 'wb') as f:
                    f.write(file_res.content)
            except Exception as e:
                print(f"❌ Failed to download {filename}: {e}")

    # --- PACKAGING STEP ---
    zip_path = os.path.join(raw_zips_dir, folder_name)
    
    if os.listdir(folder_name):
        print(f"\n📦 Packaging into {zip_path}.zip ...")
        shutil.make_archive(zip_path, 'zip', folder_name)
        print(f"✅ Success! Your file is ready at: {zip_path}.zip")
    else:
        print("❌ No files downloaded. Double check the website link.")
        
    shutil.rmtree(folder_name)

if __name__ == "__main__":
    # The exact URL from your Class 9 Biology screenshot
    url = "https://www.jagranjosh.com/articles/icse-class-9-biology-book-selina-download-chapter-wise-pdfs-1681819650-1"
    
    download_and_package_icse(url, board="ICSE", class_level="Class9", subject="Biology")