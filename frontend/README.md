# Dosnoventa Fixed Gear Web Client — Frontend (`projectITCP318-frontend`)

High-performance single-page web client for the Dosnoventa Fixed Gear Bicycles atelier. Built with **React 19**, **Vite**, **Redux Toolkit**, **MUI DataGrid**, and architectural CSS according to the *Barcelona Velodrome Atelier* design system.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite 8
- **State Management**: Redux + Redux Thunk
- **Data Tables & Charts**: Material-UI (MUI) DataGrid, Recharts
- **Forms & Validation**: React Hook Form + Yup
- **Authentication**: JWT Cookie + Firebase OAuth (Google / Facebook)
- **Styling**: Pure architectural CSS tokens with zero-radius design, Space Grotesk & Syne typography, dual Light/Dark theme engine.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/AkiraJade/projectITCP318-frontend.git
cd projectITCP318-frontend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Ensure the API URL points to the backend server:

```env
# Backend REST API
VITE_API=http://localhost:4001/api/v1

# Firebase Configuration
VITE_APP_API_KEY=your_firebase_api_key
VITE_APP_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_APP_PROJECT_ID=your_project_id
VITE_APP_STORAGE_BUCKET=your_project.appspot.com
VITE_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_APP_APP_ID=your_firebase_app_id
```

### 3. Development Server

```bash
# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🚲 Key Features

- **Storefront & Collection**:
  - Live catalog with multi-facet filters: category tabs, price range, star rating, in-stock toggle.
  - Infinite scroll loading powered by `IntersectionObserver`.
  - Responsive hero masthead with video and full-bleed lookbook sections.
- **Custom Bike Builder**:
  - Interactive configurator selecting frame, wheelsets, handlebars, saddles, and gear ratios.
- **Cart & Multi-Step Checkout**:
  - Step 1: Shipping address with country picker and saved addresses selector.
  - Step 2: Order confirmation and invoice breakdown.
  - Step 3: Payment dispatch and automated receipt generation.
- **Member Access & Profile**:
  - Customer login/register with validation errors.
  - Social login via Google / Facebook.
  - Order history tracking and detailed receipt lookup.
  - Customer review submission with star ratings and bad-word sanitization.
  - Dark Mode and Light Mode theme toggle.
- **Admin Atelier Portal (`/admin/dashboard`)**:
  - Real-time sales, order, and revenue analytics charts.
  - High-density DataGrid catalog management with zero-radius headers and tabular numerals.
  - Bulk product deletion with image cleanup.
  - Order status pipeline (`Processing`, `Assembled`, `Delivered`, `Cancelled`).
  - Trash & Recovery Vault with tabbed restore/permanent purge for products, reviews, and customers.
