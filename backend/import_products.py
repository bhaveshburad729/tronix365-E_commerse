import csv
import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import ProductDB

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def import_products(csv_file_path):
    db = SessionLocal()
    try:
        if not os.path.exists(csv_file_path):
            print(f"Error: File not found at {csv_file_path}")
            return

        with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            count = 0
            updated = 0
            
            for row in reader:
                # 1. Parse Fields
                skv = row['skv'].strip()
                title = row['title'].strip()
                category = row['category'].strip()
                
                # Numeric fields (handle empty strings)
                price = float(row['price']) if row['price'] else 0.0
                mrp = float(row['mrp']) if row['mrp'] else None
                sale_price = float(row['sale_price']) if row['sale_price'] else None
                stock = int(row['stock']) if row['stock'] else 0
                
                description = row['description'].strip()
                image = row['image'].strip()
                
                # 2. Parse Lists (Features) - Intelligent Parsing (JSON > Pipe > Comma)
                features_raw = row['features'].strip()
                features_list = []
                
                if features_raw:
                    import json
                    try:
                        # Try parsing as JSON first (e.g., ["Feat1", "Feat2"])
                        decoded = json.loads(features_raw)
                        if isinstance(decoded, list):
                            features_list = [str(item).strip() for item in decoded if str(item).strip()]
                    except json.JSONDecodeError:
                        # Fallback to delimiters
                        if '|' in features_raw:
                            delimiter = '|'
                        elif ',' in features_raw:
                            delimiter = ','
                        else:
                            delimiter = None # Treat as single item
                        
                        if delimiter:
                            features_list = [f.strip() for f in features_raw.split(delimiter) if f.strip()]
                        else:
                             features_list = [features_raw.strip()]
                
                # 3. Parse Specs (Dictionary) - Separated by pipe |, key:value
                specs_raw = row['specs'].strip()
                specs_dict = {}
                if specs_raw:
                    items = specs_raw.split('|')
                    for item in items:
                        if ':' in item:
                            k, v = item.split(':', 1)
                            specs_dict[k.strip()] = v.strip()
                
                # 4. Check if Product Exists (by SKV)
                existing_product = db.query(ProductDB).filter(ProductDB.skv == skv).first()
                
                if existing_product:
                    print(f"Updating existing product: {title} ({skv})")
                    existing_product.title = title
                    existing_product.category = category
                    existing_product.price = price
                    existing_product.mrp = mrp
                    existing_product.sale_price = sale_price
                    existing_product.stock = stock
                    existing_product.description = description
                    existing_product.image = image
                    existing_product.features = features_list
                    existing_product.specs = specs_dict
                    updated += 1
                else:
                    print(f"Creating new product: {title} ({skv})")
                    new_product = ProductDB(
                        skv=skv,
                        title=title,
                        category=category,
                        price=price,
                        mrp=mrp,
                        sale_price=sale_price,
                        stock=stock,
                        description=description,
                        image=image,
                        features=features_list,
                        specs=specs_dict
                    )
                    db.add(new_product)
                    count += 1
            
            db.commit()
            print(f"\nSuccess! Created {count} new products and updated {updated} existing products.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Default to products_template.csv if no argument provided
    filename = "products_template.csv"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        
    print(f"Importing from {filename}...")
    import_products(filename)
