# Dosnoventa E-Commerce - MongoDB Database Schema

## Overview
This document describes the normalized MongoDB database schema for the Dosnoventa fixed gear bikes e-commerce platform.

## Collection Models

### 1. User
Stores user account information and authentication data.

**Fields:**
- `name` (String, required) - User's full name
- `email` (String, required, unique) - User's email address
- `password` (String, required, select: false) - Hashed password
- `avatar` (Object) - User profile image
  - `public_id` (String) - Cloudinary public ID
  - `url` (String) - Image URL
- `addresses` (Array of ObjectId) - References to Address documents
- `defaultAddress` (ObjectId) - Reference to default Address
- `role` (String) - User role (default: 'user')
- `createdAt` (Date) - Account creation timestamp
- `resetPasswordToken` (String) - Password reset token
- `resetPasswordExpire` (Date) - Password reset token expiration

**Indexes:**
- Unique index on `email`

**Methods:**
- `getJwtToken()` - Generate JWT authentication token
- `comparePassword(enteredPassword)` - Compare password hash
- `getResetPasswordToken()` - Generate password reset token

---

### 2. Address
Stores user shipping addresses (normalized from User model).

**Fields:**
- `user` (ObjectId, required, indexed) - Reference to User
- `label` (String) - Address label (default: 'Home')
- `recipientName` (String, required) - Recipient's name
- `phone` (String, required) - Contact phone number
- `addressLine1` (String, required) - Primary address line
- `addressLine2` (String) - Secondary address line
- `city` (String, required) - City
- `province` (String) - Province/State
- `postalCode` (String, required) - Postal/ZIP code
- `country` (String, required) - Country
- `isDefault` (Boolean) - Default address flag
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Index on `user`

---

### 3. Category
Stores product categories for catalog organization.

**Fields:**
- `name` (String, required, unique) - Category name
- `slug` (String, unique) - URL-friendly slug
- `description` (String) - Category description
- `parent` (ObjectId) - Reference to parent Category (for nested categories)
- `image` (Object) - Category image
  - `public_id` (String) - Cloudinary public ID
  - `url` (String) - Image URL
- `isActive` (Boolean) - Active status flag
- `displayOrder` (Number) - Display order in UI
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Unique index on `name`
- Unique index on `slug`

---

### 4. Product
Stores individual products (bikes, parts, accessories).

**Fields:**
- `name` (String, required) - Product name
- `price` (Number, required) - Product price
- `slug` (String, sparse, unique) - URL-friendly slug
- `sku` (String, sparse, unique) - Stock keeping unit
- `description` (String, required) - Product description
- `specifications` (Map) - Key-value specifications
- `ratings` (Number) - Average rating (deprecated, use avgRating)
- `avgRating` (Number) - Average rating (0-5)
- `images` (Array) - Product images
  - `public_id` (String, required) - Cloudinary public ID
  - `url` (String, required) - Image URL
- `category` (ObjectId, required) - Reference to Category
- `isPublished` (Boolean) - Published status
- `seller` (String, required) - Seller name
- `stock` (Number, required) - Available stock
- `numOfReviews` (Number) - Number of reviews
- `user` (ObjectId) - Reference to User (admin who created)
- `createdAt` (Date) - Creation timestamp

**Indexes:**
- Sparse unique index on `slug`
- Sparse unique index on `sku`

---

### 5. Review
Stores product reviews (normalized from Product model).

**Fields:**
- `user` (ObjectId, required, indexed) - Reference to User
- `product` (ObjectId, required, indexed) - Reference to Product
- `name` (String, required) - Reviewer's name
- `rating` (Number, required, min: 1, max: 5) - Star rating
- `comment` (String, required) - Review text
- `isVerifiedPurchase` (Boolean) - Verified purchase flag
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Compound unique index on `user` and `product` (one review per user per product)
- Index on `user`
- Index on `product`

---

### 6. Frame
Stores bike frame components for custom builds.

**Fields:**
- `name` (String, required) - Frame name
- `brand` (String, required) - Frame brand
- `material` (String, required, enum: Steel, Aluminum, Carbon, Titanium)
- `sizes` (Array) - Available sizes and colors
  - `size` (String, required) - Frame size
  - `colors` (Array)
    - `color` (String, required) - Color name
    - `stock` (Number, required) - Stock count
    - `price` (Number, required) - Price for this size/color
- `description` (String, required) - Frame description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Frame images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

---

### 7. Wheelset
Stores wheelset components for custom builds.

**Fields:**
- `name` (String, required) - Wheelset name
- `brand` (String, required) - Wheelset brand
- `wheelSize` (String, required) - Wheel size
- `rimMaterial` (String, required) - Rim material
- `spokeCount` (Number, required) - Number of spokes
- `colors` (Array) - Available colors with stock and pricing
- `description` (String, required) - Wheelset description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Wheelset images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

---

### 8. Handlebar
Stores handlebar components for custom builds.

**Fields:**
- `name` (String, required) - Handlebar name
- `brand` (String, required) - Handlebar brand
- `type` (String, required, enum: Drop, Flat, Bullhorn, Track, Riser)
- `width` (String, required) - Handlebar width
- `clampDiameter` (String, required) - Clamp diameter
- `colors` (Array) - Available colors with stock and pricing
- `description` (String, required) - Handlebar description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Handlebar images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

---

### 9. Saddle
Stores saddle components for custom builds.

**Fields:**
- `name` (String, required) - Saddle name
- `brand` (String, required) - Saddle brand
- `material` (String, required) - Saddle material
- `width` (String, required) - Saddle width
- `railMaterial` (String, required) - Rail material
- `colors` (Array) - Available colors with stock and pricing
- `description` (String, required) - Saddle description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Saddle images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

---

### 10. Pedal
Stores pedal components for custom builds.

**Fields:**
- `name` (String, required) - Pedal name
- `brand` (String, required) - Pedal brand
- `type` (String, required, enum: Flat, Clipless, Cage)
- `material` (String, required) - Pedal material
- `colors` (Array) - Available colors with stock and pricing
- `description` (String, required) - Pedal description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Pedal images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

---

### 11. GearRatio
Stores gear ratio components (chainring + cog) for custom builds.

**Fields:**
- `name` (String, required) - Gear ratio name
- `chainring` (Object, required)
  - `teeth` (Number, required) - Number of teeth
  - `boltCircleDiameter` (String, required) - BCD
- `cog` (Object, required)
  - `teeth` (Number, required) - Number of teeth
  - `threadType` (String, required) - Thread type
- `ratio` (Number, required) - Calculated gear ratio (chainring teeth / cog teeth)
- `colors` (Array) - Available colors with stock and pricing
- `description` (String, required) - Gear ratio description
- `specifications` (Map) - Key-value specifications
- `images` (Array) - Gear ratio images
- `isActive` (Boolean) - Active status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Pre-save Hook:**
- Automatically calculates `ratio` as chainring teeth / cog teeth

---

### 12. CustomBuild
Stores custom bike build configurations.

**Fields:**
- `user` (ObjectId, required, indexed) - Reference to User
- `name` (String, required) - Custom build name
- `frame` (Object, required)
  - `frameId` (ObjectId, required) - Reference to Frame
  - `size` (String, required) - Selected frame size
  - `color` (String, required) - Selected frame color
- `wheelset` (Object, required)
  - `wheelsetId` (ObjectId, required) - Reference to Wheelset
  - `color` (String, required) - Selected wheelset color
- `handlebar` (Object, required)
  - `handlebarId` (ObjectId, required) - Reference to Handlebar
  - `color` (String, required) - Selected handlebar color
- `saddle` (Object, required)
  - `saddleId` (ObjectId, required) - Reference to Saddle
  - `color` (String, required) - Selected saddle color
- `pedal` (Object, required)
  - `pedalId` (ObjectId, required) - Reference to Pedal
  - `color` (String, required) - Selected pedal color
- `gearRatio` (Object, required)
  - `gearRatioId` (ObjectId, required) - Reference to GearRatio
  - `color` (String, required) - Selected gear ratio color
- `totalPrice` (Number, required) - Total build price
- `images` (Array) - Build preview images
- `isSaved` (Boolean) - Saved build flag
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Index on `user`

---

### 13. Cart
Stores user shopping cart data.

**Fields:**
- `user` (ObjectId, required, unique, indexed) - Reference to User
- `items` (Array) - Cart items
  - `type` (String, required, enum: product, customBuild)
  - `product` (ObjectId) - Reference to Product (if type is product)
  - `customBuild` (ObjectId) - Reference to CustomBuild (if type is customBuild)
  - `quantity` (Number, required, min: 1) - Item quantity
  - `price` (Number, required) - Item price
  - `name` (String, required) - Item name
  - `image` (String, required) - Item image URL
- `subtotal` (Number, required) - Subtotal before tax/shipping
- `tax` (Number, required) - Tax amount
- `shipping` (Number, required) - Shipping cost
- `total` (Number, required) - Total amount
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Unique index on `user`

---

### 14. Order
Stores customer orders.

**Fields:**
- `referenceNumber` (String, required, unique) - Unique order reference
- `user` (ObjectId, required, indexed) - Reference to User
- `deliveryMethod` (String, required, enum: delivery, pickup)
- `deliveryAddress` (ObjectId) - Reference to Address (if delivery)
- `pickupDetails` (Object) - Pickup details (if pickup)
  - `date` (Date) - Pickup date
  - `timeSlot` (String) - Pickup time slot
- `orderItems` (Array) - Order items
  - `type` (String, required, enum: product, customBuild)
  - `name` (String, required) - Item name
  - `quantity` (Number, required, min: 1) - Item quantity
  - `image` (String, required) - Item image URL
  - `price` (Number, required) - Item price
  - `product` (ObjectId) - Reference to Product (if type is product)
  - `customBuild` (ObjectId) - Reference to CustomBuild (if type is customBuild)
- `paymentInfo` (Object, required)
  - `method` (String, required, enum: COD, GCash, PayMaya, CreditCard, DebitCard)
  - `id` (String) - Payment transaction ID
  - `status` (String, required) - Payment status
- `paidAt` (Date) - Payment timestamp
- `itemsPrice` (Number, required) - Items subtotal
- `taxPrice` (Number, required) - Tax amount
- `shippingPrice` (Number, required) - Shipping cost
- `totalPrice` (Number, required) - Total amount
- `orderStatus` (String, required, enum: Pending, Assembling, Ready for Pickup, Out for Delivery, Delivered, Cancelled)
- `statusHistory` (Array) - Status change history
  - `status` (String, required) - Status value
  - `updatedAt` (Date) - Timestamp
  - `updatedBy` (ObjectId) - Reference to User (admin)
  - `notes` (String) - Status change notes
- `deliveredAt` (Date) - Delivery timestamp
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

**Indexes:**
- Unique index on `referenceNumber`
- Index on `user`

---

### 15. OrderStatus
Stores order status change history (separate from Order for detailed tracking).

**Fields:**
- `order` (ObjectId, required, indexed) - Reference to Order
- `status` (String, required, enum: Pending, Assembling, Ready for Pickup, Out for Delivery, Delivered, Cancelled)
- `previousStatus` (String) - Previous status
- `updatedBy` (ObjectId, required) - Reference to User (admin)
- `notes` (String) - Status change notes
- `timestamp` (Date) - Status change timestamp

**Indexes:**
- Index on `order`
- Compound index on `order` and `timestamp` (descending)

---

### 16. Notification
Stores email notification records.

**Fields:**
- `user` (ObjectId, required, indexed) - Reference to User
- `order` (ObjectId, indexed) - Reference to Order (if applicable)
- `type` (String, required, enum: order_confirmation, order_status_update, password_reset, promotional)
- `subject` (String, required) - Email subject
- `message` (String, required) - Email message body
- `email` (String, required) - Recipient email
- `status` (String, required, enum: pending, sent, failed)
- `sentAt` (Date) - Sent timestamp
- `error` (String) - Error message (if failed)
- `metadata` (Map) - Additional metadata
- `createdAt` (Date) - Creation timestamp

**Indexes:**
- Index on `user`
- Compound index on `user` and `createdAt` (descending)
- Compound index on `status` and `createdAt` (descending)

---

## Normalization Benefits

1. **Reduced Data Redundancy**: Addresses and reviews are extracted into separate collections
2. **Better Query Performance**: Indexed fields enable faster lookups
3. **Scalability**: Easier to add new features without modifying existing schemas
4. **Data Integrity**: Foreign key references maintain relationships
5. **Flexibility**: Component models (Frame, Wheelset, etc.) allow independent management

## Key Relationships

- User → Address (one-to-many)
- User → Cart (one-to-one)
- User → CustomBuild (one-to-many)
- User → Order (one-to-many)
- User → Review (one-to-many)
- Category → Product (one-to-many)
- Product → Review (one-to-many)
- CustomBuild → Frame, Wheelset, Handlebar, Saddle, Pedal, GearRatio (many-to-one each)
- Order → User (many-to-one)
- Order → Address (many-to-one, optional)
- Order → Product, CustomBuild (many-to-many via orderItems)
- Order → OrderStatus (one-to-many)
- Order → Notification (one-to-many)

## Initialization

Run the database initialization script to seed initial categories:

```bash
cd projectReact/backend
node scripts/initDatabase.js
```

This will create the default product categories in the database.
