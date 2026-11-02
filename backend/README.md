# Dosnoventa Fixed Gear API — Backend (`projectITCP318-backend`)

REST API service for the Dosnoventa Fixed Gear Bicycles e-commerce platform. Built with **Node.js**, **Express**, **MongoDB Atlas (Mongoose 8/9)**, **Cloudinary**, and **JWT**.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose
- **Image Storage**: Cloudinary SDK
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Email & Receipts**: Nodemailer & PDFKit automated invoice receipts

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/AkiraJade/projectITCP318-backend.git
cd projectITCP318-backend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `config/.env` file (you can copy from `config/.env.example`):

```bash
cp config/.env.example config/.env
```

Ensure the following variables are configured:

```env
PORT=4001
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:5173

# Database Connection
DB_URI=mongodb+srv://<username>:<password>@cluster0.igi3r.mongodb.net/Dosnoventa?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# Mailer (Mailtrap or SMTP)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=noreply@dosnoventa.com
SMTP_FROM_NAME=Dosnoventa
```

### 3. Seed Database (Optional)

To seed all 13 collections with authentic bicycles, framesets, wheelsets, handlebars, reviews, and test accounts:

```bash
npm run seed
```

Default credentials seeded:
- **Admin**: `admin@gmail.com` / `password123`
- **Customer**: `user@gmail.com` / `password123`

### 4. Running the Server

```bash
# Development (with auto-restart via nodemon)
npm run dev

# Production
npm start
```

The API will be live at `http://localhost:4001`.

---

## 📡 API Endpoints Overview

### Authentication & Users (`/api/v1`)
- `POST /register` — Register new customer account
- `POST /login` — Authenticate and receive JWT cookie
- `GET /logout` — Clear session / cookie
- `GET /me` — Current authenticated user profile
- `PUT /me/update` — Update profile details
- `PUT /password/update` — Update password
- `POST /password/forgot` — Request password reset email
- `PUT /password/reset/:token` — Reset password via token
- `POST /auth/social-login` — Firebase Google / Facebook OAuth sync
- `GET /admin/users` — Admin: list all users
- `DELETE /admin/user/:id` — Admin: soft-delete customer account

### Products & Reviews (`/api/v1`)
- `GET /products` — Get filtered & paginated products (keyword, category, price, rating)
- `GET /product/:id` — Single product technical dossier
- `POST /admin/product/new` — Admin: create product with images
- `PUT /admin/product/:id` — Admin: update product specifications
- `DELETE /admin/product/:id` — Admin: soft-delete product
- `DELETE /admin/products/bulk` — Admin: bulk delete products
- `PUT /review` — Create or update product review (with profanity filter)
- `GET /reviews` — Get all reviews for a product

### Orders & Checkout (`/api/v1`)
- `POST /order/new` — Place order with shipping and payment info
- `GET /order/:id` — Get single order details
- `GET /orders/me` — My orders history
- `GET /admin/orders` — Admin: list all orders
- `PUT /admin/order/:id` — Admin: update order status + automated PDF receipt dispatch
- `DELETE /admin/order/:id` — Admin: delete order record

### Recovery & Trash Vault (`/api/v1`)
- `GET /admin/trash` — List all soft-deleted products, reviews, and users
- `PUT /admin/trash/restore/:type/:id` — Restore item back to active production
- `DELETE /admin/trash/permanent/:type/:id` — Permanent purge
