# Functional Requirements Document

## Dosnoventa - Fixed Gear Bikes E-Commerce Website

**Prepared by:**
- Sedriel H. Navasca
- Ardee Jhade B. Orlanda

**Section:** BSIT - S - 3A

---

## 1. User Authentication & Account Management

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 1.1 | User Registration | The system shall allow customers to create an account using their name, email address, contact number, and password. |
| FR 1.2 | User Login & Session | The system shall allow registered users to log in securely with email and password, maintaining session state. |
| FR 1.3 | Password Recovery | The system shall allow users to reset a forgotten password through a secure, time-limited link sent to their registered email address. |
| FR 1.4 | Profile Management | Customers shall be able to view and update their personal details, saved shipping addresses, and contact numbers. |

## 2. Product Catalog & Browsing

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 2.1 | Category Browsing | The system shall display products categorized into logical groups (e.g., Complete Bikes, Frames & Forks, Wheelsets, Cranksets & Drivetrain, Handlebars & Stems, Saddles & Seatposts, Pedals, Accessories). |
| FR 2.2 | Product Search | The system shall provide a search bar enabling users to find bikes and parts by keyword, item title, or part type. |
| FR 2.3 | Filter & Sort | Users shall be able to filter items by price range, frame size, color, and frame material (e.g., steel, aluminum), and sort by popularity, price, or newest arrivals. |
| FR 2.4 | Product Details Page | The system shall display detailed information for each item, including high-res images, price, description, specifications, frame geometry or size chart, and compatibility notes. |

## 3. Bike Customization & Cart Management

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 3.1 | Bike Customization | The system shall allow users to customize a selected fixed gear bike build (frame size, frame color, wheelset, handlebar type, saddle, pedals, and gear ratio/cog and chainring combination). |
| FR 3.2 | Add to Cart | Users shall be able to select quantity and add complete bikes, custom builds, or individual parts to a dynamic shopping cart. |
| FR 3.3 | Modify Cart | Users shall be able to view, adjust quantities, or delete items from their shopping cart prior to checkout. |
| FR 3.4 | Real-time Calculation | The cart shall automatically compute subtotal, applicable taxes, delivery charges, and total cost dynamically, including the price of any selected custom components. |

## 4. Ordering & Payment Gateway

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 4.1 | Delivery/Pickup Selection | Users shall select between store pickup (with date/time slot) or home delivery (with delivery address selection). |
| FR 4.2 | Payment Integration | The system shall support Cash on Delivery (COD) and electronic payment methods (GCash, PayMaya, Credit/Debit Card). |
| FR 4.3 | Order Confirmation | The system shall generate a unique Order Reference Number and display/email a downloadable receipt upon successful checkout. |
| FR 4.4 | Order History & Tracking | Customers shall be able to view their previous orders and check real-time status (e.g., Pending, Ready for Pickup, Out for Delivery, Delivered). |

## 5. Administration & Order Processing

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 5.1 | Product & Inventory Management | Admins shall be able to add, update, disable, or delete bikes and parts, prices, images, specifications, and stock levels per size and color. |
| FR 5.2 | Order Fulfillment Workflow | Admins shall have a dashboard to view incoming orders and update status (Pending -> Assembling -> Out for Delivery -> Completed). |
| FR 5.3 | Sales Reports | The system shall generate basic summary reports showing daily, weekly, and monthly sales and top-selling bikes and parts. |

## 6. Customer Feedback & Notifications

| Req ID | Requirement Name | Description |
|--------|------------------|-------------|
| FR 6.1 | Product Ratings & Reviews | Verified buyers shall be able to post ratings (1 to 5 stars) and write text reviews on purchased items. |
| FR 6.2 | Email Notifications | Automated emails shall be sent to notify customers on order confirmation and status updates. |
