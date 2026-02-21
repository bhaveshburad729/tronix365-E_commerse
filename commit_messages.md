Here are the meaningful commit messages for each modified file, generated without using the words "feat" or "chore":

### `backend/check_db.py`
Enhance database inspection script to clearly display recent orders and users with improved formatting.

### `backend/email_utils.py`
Implement responsive HTML template generation and dispatch logic for order confirmation emails.

### `backend/main.py`
Integrate asynchronous background tasks for email delivery, enforce global product stock validation on purchases, and introduce profile update endpoints.

### `backend/models.py`
Expand database schemas by adding order creation timestamps, user profile picture URLs, and a new contact message model.

### `backend/requirements.txt`
Include psycopg2-binary dependency to support PostgreSQL database connectivity.

### `backend/seed.py`
Remove hardcoded IDs from initial product data to ensure seamless auto-incrementing during database population.

### `src/App.jsx`
Configure router basename for proper subdirectory deployment and register new routes for order details and invoice views.

### `src/components/home/InfoSections.jsx`
Redesign contact interface applying Neo-Glass aesthetics with animated gradients, glassmorphism, and improved form validation.

### `src/components/layout/Footer.jsx`
Upgrade footer layout with premium styling, interactive social media icons, and comprehensive company leadership details.

### `src/components/layout/Navbar.jsx`
Improve logout flow by enforcing a strict page redirect and ensuring complete removal of cached cart and wishlist data.

### `src/index.css`
Define shimmer animation keyframes to support dynamic loading and interactive UI states.

### `src/pages/AdminDashboard.jsx`
Upgrade administration dashboard with order search capabilities, status filtering, a detailed order inspection modal, and monthly revenue growth metrics.

### `src/pages/Checkout.jsx`
Automate checkout form initialization by pre-filling fields with the authenticated user's stored profile data.

### `src/pages/UserDashboard.jsx`
Enrich user portal with profile picture uploads, personal information editing, order status filtering tabs, and a visual order tracking pipeline.

### `vite.config.js`
Define project base path in build configuration to ensure correct asset resolution during production deployment.
