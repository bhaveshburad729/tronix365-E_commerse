# Tronix365 E-commerce Platform

## Project Description
Tronix365 is a full-stack e-commerce application designed for selling electronics and gadgets. It features a modern, responsive user interface built with React and a robust backend API powered by FastAPI. The platform supports user authentication, product management, shopping cart functionality, and payment processing integration.

## Features
- **User Authentication**: Secure Signup and Login with JWT.
- **Product Catalog**: Browse products by category, filter by price, and sort.
- **Product Details**: View detailed specifications and reviews.
- **Shopping Cart**: Add items, update quantities, and view total.
- **Checkout Process**: Integrated payment gateway flow (PayU).
- **Admin Dashboard**: Manage products and orders (protected route).
- **Responsive Design**: Optimized for mobile and desktop using TailwindCSS.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS 4, React Router DOM 7
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL (Production) / SQLite (Local Dev)
- **Deployment**: Ready for Vercel/Render (Frontend) and Cloud Platforms (Backend)

## Folder Structure
```
project-root/
|-- backend/             # FastAPI Backend Server
|   |-- main.py          # Application Entry Point
|   |-- models.py        # Database Models
|   |-- schemas/         # Pydantic Schemas (if separated)
|   |-- database.py      # Database Connection
|   |-- auth.py          # Authentication Logic
|   |-- tronix_env/      # Python Virtual Environment
|
|-- src/                 # React Frontend Source
|   |-- components/      # Reusable UI Components
|   |-- pages/           # Page Components (Routes)
|   |-- context/         # Global State (Cart, Wishlist)
|   |-- hooks/           # Custom React Hooks
|   |-- assets/          # Static Images and Icons
|
|-- public/              # Static Assets (Favicon, etc.)
|-- .gitignore           # Git Ignore Rules
|-- package.json         # Frontend Dependencies
|-- README.md            # Project Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL (Optional, for production DB)

### 1. Backend Setup
Navigate to the backend directory:
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
DATABASE_URL=sqlite:///./tronix365.db  # Or your PostgreSQL URL
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt
```

Run the Server:
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
Navigate to the project root:
```bash
cd ..
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

## Installed Packages

### Backend (Python)
- `fastapi`: Web framework for building APIs.
- `uvicorn`: ASGI server for running FastAPI.
- `sqlalchemy`: ORM for database interactions.
- `python-jose[cryptography]`: JWT token handling.
- `passlib[bcrypt]`: Password hashing.
- `python-dotenv`: Loading environment variables.
- `pydantic`: Data validation.

### Frontend (npm)
- `react`: UI library.
- `react-router-dom`: Client-side routing.
- `axios`: HTTP client (recommended for API calls).
- `tailwindcss`: Utility-first CSS framework.
- `framer-motion`: Animation library.
- `lucide-react`: Icon set.
- `react-hot-toast`: Toast notifications.

## Environment Variables
The application requires the following environment variables in `backend/.env`:
- `DATABASE_URL`: Connection string for the database.
- `SECRET_KEY`: Secret key for JWT encryption.
- `PAYU_KEY` & `PAYU_SALT`: Credentials for PayU payment gateway.

## Future Scope
- **Dockerization**: Add Docker support for easy deployment.
- **Testing**: Implement unit tests for backend (pytest) and frontend (Jest).
- **CI/CD**: Set up automated pipelines for testing and deployment.
- **Enhanced Security**: Implement role-based access control (RBAC) more strictly.
