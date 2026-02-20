# Tronix365 E-commerce Platform

## Project Description
Tronix365 is a full-stack e-commerce application designed for selling electronics and gadgets. It features a modern, responsive user interface built with React and a robust backend API powered by FastAPI. The platform supports user authentication, product management, shopping cart functionality, payment processing integration, and a comprehensive admin dashboard.

## Features
- **User Authentication**: Secure Signup and Login with JWT and password visibility toggles.
- **Product Catalog**: Browse products by category, filter by price, sort, and paginate through large lists.
- **Product Details**: View detailed specifications, images, and reviews.
- **Shopping Cart**: Add items, update quantities, and view total cost dynamically.
- **Checkout Process**: Integrated payment gateway flow (PayU) with order confirmation.
- **Admin Dashboard**: 
    - View aggregate statistics (Revenue, Orders, Products, Users).
    - Manage products and orders with paginated lists.
- **User Dashboard**: View personal order history with pagination and profile details.
- **Responsive Design**: Optimized for mobile and desktop using TailwindCSS and Glassmorphism aesthetics.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS 4, React Router DOM 7
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL (Production) / SQLite (Local Dev)
- **Deployment**: Ready for Vercel/Render (Frontend) and Cloud Platforms (Backend)

## Folder Structure
```
project-root/
|-- backend/             # FastAPI Backend Server
|   |-- main.py          # Application Entry Point & API Routes
|   |-- models.py        # Database Models
|   |-- schemas/         # Pydantic Schemas
|   |-- database.py      # Database Connection
|   |-- auth.py          # Authentication Logic
|   |-- seed.py          # Script to populate initial data
|   |-- tronix_env/      # Python Virtual Environment
|
|-- client/              # React Frontend Source (Project Root acts as client in this repo setup)
|   |-- src/
|   |   |-- components/  # Reusable UI Components
|   |   |-- pages/       # Page Components (Routes: Shop, Login, Dashboard, etc.)
|   |   |-- context/     # Global State (CartContext)
|   |   |-- api/         # Axios Client Configuration
|   |   |-- assets/      # Static Images and Icons
|
|-- public/              # Static Assets (Favicon, etc.)
|-- README.md            # Project Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Create and activate the virtual environment:
```bash
# Windows
python -m venv tronix_env
tronix_env\Scripts\activate

# Linux/Mac
python3 -m venv tronix_env
source tronix_env/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up Environment Variables:
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=sqlite:///./tronix365.db
SECRET_KEY=your_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Seed the Database (Optional but recommended for first run):
```bash
python seed.py
```

Run the Server:
Make sure you are inside the `backend` directory:
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the project root:
```bash
cd ..  # If you were in backend, go back to root
# OR
cd "path/to/project-root"
```

Install dependencies:
```bash
npm install
```

Run the Development Server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## API Documentation
Key endpoints available:

-   **Auth**: `/signup`, `/login`, `/profile`
-   **Products**: `/products` (Supports `skip` and `limit` for pagination)
-   **Orders**: 
    -   `/orders` (Admin: List all orders with pagination)
    -   `/orders/user` (User: List personal orders with pagination)
    -   `/orders` (POST: Create new order)
-   **Admin**: `/admin/stats` (Aggregate dashboard metrics)

## Installed Packages

### Backend (Python)
- `fastapi`: Web framework.
- `uvicorn`: ASGI server.
- `sqlalchemy`: Database ORM.
- `python-jose`: JWT token handling.
- `passlib`: Password hashing.
- `pydantic`: Data validation.

### Frontend (npm)
- `react`, `react-dom`: Core framework.
- `react-router-dom`: Routing.
- `axios`: API requests.
- `tailwindcss`: Styling.
- `framer-motion`: Animations.
- `lucide-react`: Icons.
- `react-hot-toast`: Notifications.

## Environment Variables
Ensure `backend/.env` is configured correctly for the database and secret keys. For frontend, vite uses `.env` in the root if needed (e.g., `VITE_API_URL`).
