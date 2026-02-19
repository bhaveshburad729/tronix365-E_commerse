# Product Data Import Guide

## 1. Image Handling (Direct Images)

You can use images from the internet (URL) or from your local computer.

### Option A: Local Images (Recommended)
1.  **Gather your images**: Collect all your product photos (e.g., `arduino.jpg`, `sensor_01.png`).
2.  **Place them in the project**:
    *   Copy all these images into the folder: `src/assets/products/`
    *   *(Note: You might need to create the `products` folder inside `src/assets` if it doesn't exist)*
3.  **In the CSV**:
    *   Just write the **filename**.
    *   **Correct**: `arduino.jpg`
    *   **Incorrect**: `C:/Users/Photo/arduino.jpg`

### Option B: Internet Images
1.  **In the CSV**:
    *   Paste the full link.
    *   Example: `https://example.com/images/arduino.jpg`

---

## 2. CSV File Format

**File Name**: `products.csv` (save as standard CSV comma-separated).

### Column Definition

| Column Name | Required? | Description | Example |
| :--- | :--- | :--- | :--- |
| **`skv`** | **YES** | **Unique ID** for the product. Used to update existing items. | `ARD-001` or `SKV-105` |
| `title` | YES | Name of the product. | `Arduino Uno R3` |
| `category` | YES | Category name (grouping). | `Development Boards` |
| `stock` | YES | Number of items available. | `50` |
| `sale_price` | YES | **Selling Price** (The actual price customer pays). | `450` |
| `mrp` | No | Maximum Retail Price (shown crossed out). | `650` |
| `features` | No | Bullet points list. **Use `|` to separate items.** | `Low Power|5V Logic|USB-C` |
| `specs` | No | Technical details. **Use `|` to separate items, `:` for value.** | `Voltage:5V|Memory:2KB` |
| `image` | YES | Filename (see Section 1) or URL. | `arduino.jpg` |
| `description`| No | Paragraph text describing the item. | `A powerful microcontroller...` |

---

## 3. Example Rows

**Simple Product:**
```csv
skv,title,stock,sale_price,image
SKV-01,Basic LED,100,5,led_red.jpg
```

**Advanced Product with Features:**
```csv
skv,title,stock,sale_price,mrp,features,specs
RPI-4,Raspberry Pi 4,20,4500,5500,Quad Core CPU|4GB RAM|WiFi,RAM:4GB|CPU:1.5GHz
```

## 4. How to Run Import

1.  Save your file as `products.csv` in the `backend/` folder.
2.  Open terminal in `backend/` folder.
3.  Run the command:
    ```bash
    python import_products.py
    ```
