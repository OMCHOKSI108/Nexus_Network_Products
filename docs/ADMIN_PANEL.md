# ADMIN PANEL – PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Overview

The Admin Panel for **Nexus Network Products** will serve as the centralized control system for business operations, security, analytics, and automation. It is designed as an enterprise-grade back-office platform, not just a CRUD dashboard.

---

## 2. Goals

* Provide complete operational control over users, products, orders, revenue, and AI.
* Enable real-time visibility into business performance.
* Ensure security, auditability, and compliance.
* Support scalability for future growth (multi-admin, roles, automation).

---

## 3. User Roles (Phase-wise)

### Phase 1

* **Super Admin** – full system control.

### Phase 2 (Future)

* Operations Admin
* Support Admin
* Finance Admin

---

## 4. Core Modules

### 4.1 Dashboard

**Purpose:** Business snapshot
**KPIs:**

* Today’s revenue
* Orders today
* Active users
* Low stock alerts
* AI usage today

---

### 4.2 User Management

**Features:**

* View/search/filter users
* Block/unblock users
* Soft delete & permanent delete
* Reset password
* Force logout
* Export users to CSV

**Advanced:**

* User activity timeline
* Risk tagging (VIP, inactive, suspicious)

---

### 4.3 Product Management

**Features:**

* Full CRUD
* Bulk update prices & stock
* Activate/deactivate product
* SKU validation
* Product performance metrics

---

### 4.4 Order Management

**Features:**

* Order lifecycle control
* Status updates
* Customer & address view
* Internal notes
* Export orders

---

### 4.5 Revenue & Profit

**Features:**

* Daily/monthly revenue
* Category-wise sales
* Product-wise performance
* CSV export
* GST-ready reports

---

### 4.6 User Activity Tracking

**Tracked Events:**

* Login/logout
* Add to cart
* Order placed/cancelled
* Password reset
* Chatbot usage

---

### 4.7 Chatbot & AI Control

**Features:**

* View conversations
* Delete conversations
* Feedback analytics
* Popular queries
* AI usage stats

---

### 4.8 Security & Audit

**Features:**

* Failed login monitoring
* IP blocking
* Token invalidation
* Admin action logs
* Session tracking

---

## 5. Backend API Scope

### 5.1 Admin Dashboard

* GET /api/admin/dashboard/overview

### 5.2 Users

* GET /api/admin/users
* PUT /api/admin/users/:id/block
* DELETE /api/admin/users/:id
* GET /api/admin/users/export/csv

### 5.3 Products

* POST /api/admin/products
* PUT /api/admin/products/:id
* DELETE /api/admin/products/:id
* POST /api/admin/products/bulk-update

### 5.4 Orders

* GET /api/admin/orders
* PUT /api/admin/orders/:id/status

### 5.5 Revenue

* GET /api/admin/revenue/summary
* GET /api/admin/revenue/export

### 5.6 Logs & Security

* GET /api/admin/logs
* POST /api/admin/security/block-ip

---

## 6. New Data Models

### AdminAuditLog

* adminId
* actionType
* targetType
* targetId
* ip
* timestamp

### UserActivityLog

* userId
* action
* device
* ip
* timestamp

---

## 7. Non-Functional Requirements

* Role-based access control
* API rate limiting
* Audit trail for every admin action
* Export data in CSV
* 99.9% admin panel uptime target

================================================================================

# ADMIN PANEL – UI WIREFRAME & DESIGN BLUEPRINT

## 1. Layout Structure

### Global Layout

* **Left Sidebar:** navigation
* **Top Bar:** search, notifications, admin profile
* **Main Area:** dynamic content

---

## 2. Navigation Map

* Dashboard
* Users
* Products
* Orders
* Revenue
* Activity Logs
* Chatbot Control
* Security Center
* Settings

---

## 3. Visual Theme

* Dark sidebar (navy)
* Light workspace
* Brass accent for highlights
* Clean enterprise look

---

## 4. Page-by-Page Wireframe Description

### 4.1 Dashboard

**Layout:**

* Top row: KPI cards (Revenue, Orders, Users, Stock Alerts)
* Middle: Revenue trend chart
* Bottom: Recent orders table

---

### 4.2 Users Page

**Layout:**

* Top: Search + filters
* Center: Data table
* Right: Slide-out user detail panel

**User Detail Panel:**

* Profile info
* Orders history
* Activity timeline
* Block/Delete buttons

---

### 4.3 Products Page

**Layout:**

* Bulk action bar on top
* Product table
* Inline edit
* Status toggles

---

### 4.4 Orders Page

**Layout Options:**

* Table view OR
* Kanban board (Pending → Delivered)

**Order Side Panel:**

* Customer details
* Items
* Status update
* Internal notes

---

### 4.5 Revenue Page

**Layout:**

* Monthly revenue chart
* Category-wise bar chart
* Export buttons

---

### 4.6 Activity Logs

**Layout:**

* Timeline view
* Filters by user, date, action

---

### 4.7 Chatbot Control

**Layout:**

* Conversation list
* Chat preview panel
* Analytics widgets

---

### 4.8 Security Center

**Layout:**

* Failed login attempts table
* Blocked IP list
* Active admin sessions
* Token invalidation button

---

## 5. UX Principles

* Zero clutter
* Data-first design
* One-click actions
* Clear confirmation modals for destructive actions
* Role-based UI visibility

---

## 6. Future UI Enhancements

* Dark mode toggle
* Multi-admin support
* Workflow automation UI
* Custom dashboard widgets

================================================================================


inshort:

I’ve studied your project documentation carefully and I’ll design this like a **production-grade admin system** — not just a control panel, but a real **business command center** for Nexus Network Products.

Below is a **complete blueprint** you can directly hand to your frontend + backend agents.

---

# 1️⃣ What a PERFECT Admin Panel should be (for your project)

For a B2B e-commerce platform like yours, the admin panel is not “just CRUD”.
It is a **business operating system** with 6 core responsibilities:

1. **Control** – manage products, users, orders
2. **Visibility** – analytics, profits, trends
3. **Security** – roles, blocks, audit logs
4. **Automation** – exports, alerts, workflows
5. **Compliance** – activity logs, traceability
6. **Scalability** – future-proof structure

---

# 2️⃣ Admin Panel – Feature Map

## A. Core Modules

### 1. Dashboard (Home)

Purpose: instant business snapshot

**Widgets**

* Today’s revenue
* Orders today / this week
* Top 5 products
* Low stock alerts
* Active users right now
* Failed logins / security alerts

---

### 2. User Management

You already have users — now make them **manageable**.

**Admin abilities**

* View all users
* Search / filter (email, company, GST, date joined)
* Block / unblock user
* Soft delete / permanent delete
* Reset password
* Force logout
* View activity history

**Extra**

* Export users to CSV
* Tag users (VIP, Bulk Buyer, Risky, Inactive)

---

### 3. Product Management

Beyond CRUD.

**Admin powers**

* Bulk upload (CSV/Excel later)
* Bulk price update
* Stock threshold alerts
* Activate / deactivate product
* SKU conflict detection
* See product performance:

  * views
  * adds to cart
  * purchases

---

### 4. Order & Revenue Control

**Admin views**

* Order lifecycle board

  * Pending → Confirmed → Processing → Shipped → Delivered
* Filter by:

  * status
  * payment
  * city / state
  * company

**Profit tracking**

* Total revenue
* Monthly revenue
* Category-wise revenue
* Product-wise profit (future: cost price support)

**Exports**

* Orders CSV
* Revenue CSV
* GST-ready report format

---

### 5. User Activity Tracking (Very important)

This turns your system from “website” to “enterprise grade”.

Track:

* login time
* logout time
* IP address
* device
* actions:

  * added product
  * placed order
  * cancelled order
  * reset password
  * chatbot used

Admin sees:

* User activity timeline
* Suspicious behavior flags

---

### 6. Chatbot & AI Control

Since your platform has AI, admin must control it.

**Admin features**

* View conversations
* Delete conversations
* Flag bad responses
* View most asked questions
* Feedback analytics
* AI usage stats

---

### 7. Security & Control Center

This is where you become serious.

**Admin can**

* Block IPs
* View failed login attempts
* Force token invalidation
* View audit logs
* Change admin passwords
* Enable / disable features

---

# 3️⃣ Backend – How Admin APIs should be structured

You already have:

```
/api/admin/login
/api/admin/verify
```

Now you need a **real admin API layer**.

---

## A. Admin API Architecture

Create a new namespace:

```
/api/admin/*
```

### Core middleware

* `adminAuth`
* `adminRoleGuard`
* `auditLogger`

---

## B. New Required Admin APIs

### 1. Admin Dashboard

```
GET /api/admin/dashboard/overview
```

Returns:

* revenue stats
* orders count
* user growth
* low stock

---

### 2. User Control

```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/block
PUT    /api/admin/users/:id/unblock
DELETE /api/admin/users/:id
GET    /api/admin/users/export/csv
```

---

### 3. Product Control

```
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
PUT    /api/admin/products/:id/toggle
POST   /api/admin/products/bulk-update
```

---

### 4. Order & Revenue

```
GET /api/admin/orders
PUT /api/admin/orders/:id/status
GET /api/admin/revenue/summary
GET /api/admin/revenue/export
```

---

### 5. Activity Logs (NEW MODEL)

Add new collection: `AdminAuditLog`

```
GET /api/admin/logs
GET /api/admin/logs/user/:userId
```

---

### 6. Chatbot Control

```
GET    /api/admin/chat/conversations
DELETE /api/admin/chat/conversation/:id
GET    /api/admin/chat/analytics
```

---

### 7. Security

```
GET  /api/admin/security/logins
POST /api/admin/security/block-ip
POST /api/admin/security/unblock-ip
POST /api/admin/security/invalidate-tokens
```

---

# 4️⃣ New Backend Models you should add

## 1. AdminAuditLog

Tracks **every admin action**

Fields:

* adminId
* actionType (DELETE_USER, BLOCK_USER, UPDATE_PRODUCT…)
* targetType (USER, PRODUCT, ORDER)
* targetId
* ip
* timestamp
* metadata

---

## 2. UserActivityLog

Tracks **user behavior**

Fields:

* userId
* action (LOGIN, ADD_TO_CART, ORDER_PLACED…)
* device
* ip
* timestamp

---

## 3. RevenueSnapshot (optional but powerful)

Stores daily revenue for fast dashboards.

---

# 5️⃣ Frontend – Admin Panel Design System

You don’t need code now, so here is the **exact UI concept** your agent should follow.

---

## A. Layout Structure

### Left Sidebar

* Dashboard
* Users
* Products
* Orders
* Revenue
* Chatbot
* Activity Logs
* Security
* Settings

---

### Top Bar

* Search (global)
* Notifications
* Admin profile
* Logout

---

## B. Design Style

Since your brand is B2B industrial:

**Theme**

* Dark sidebar
* Light content area
* Brass accent color for highlights
* Navy + gray base

**Feel**

* Serious
* Clean
* Data-focused
* No childish UI

---

## C. Page-by-Page UI Explanation

### 1. Dashboard

Grid of cards:

* Revenue
* Orders
* Users
* Stock alerts
  Charts:
* Revenue trend
* Orders per day

---

### 2. Users Page

Table with:

* Name
* Email
* Company
* Status
* Last login
* Actions:

  * View
  * Block
  * Delete
  * Export

Click user → opens **User Profile Panel**

* Full activity timeline
* Orders history
* Chatbot usage

---

### 3. Products Page

Table:

* Image
* Name
* SKU
* Stock
* Status
* Actions

Bulk actions bar:

* Update price
* Toggle active
* Export

---

### 4. Orders Page

Kanban view OR table view
Filters on top
Order details side panel:

* Customer
* Address
* Items
* Status change
* Notes

---

### 5. Revenue Page

Charts:

* Monthly revenue
* Category revenue
  Buttons:
* Export CSV
* Download GST report

---

### 6. Activity Logs

Timeline style:

* Who did what
* When
* From where

Search:

* by user
* by action
* by date

---

### 7. Security Center

Panels:

* Failed login attempts
* Blocked IPs
* Active admin sessions
* Token invalidation

---

# 6️⃣ Admin Authentication – Correct way

Your current idea of storing:

```
ADMIN_EMAIL
ADMIN_PASSWORD
```

is okay for **phase 1**, but perfect system should be:

## Phase 1 (now)

* Single super admin via env
* JWT with admin role
* Admin-only routes

## Phase 2 (future)

* Admin table in DB
* Roles:

  * Super Admin
  * Operations
  * Support
  * Finance
* Permissions matrix

---

# 7️⃣ CSV, Profit, Delete, Block – How they fit

| Feature         | Where it belongs                              |
| --------------- | --------------------------------------------- |
| CSV export      | Users, Orders, Revenue modules                |
| Profit tracking | Revenue + Orders analytics                    |
| Delete          | Soft delete first, hard delete by super admin |
| Block           | User Management + Security                    |
| Activity track  | UserActivityLog + AdminAuditLog               |

---

# 8️⃣ Final Architecture View (conceptual)

```
ADMIN PANEL (React)
        |
        v
/api/admin/*
        |
  Admin Auth Middleware
        |
----------------------------------
| Users | Orders | Products | AI |
----------------------------------
        |
 MongoDB
 (Users, Orders, Products,
  UserActivityLog,
  AdminAuditLog)
```

---

# 9️⃣ What you now have

You now have:

* A **complete admin panel definition**
* A **scalable backend API plan**
* A **clear frontend design system**
* A **security-first architecture**
* A **business-grade control center**, not just CRUD

This is the level used in:

* B2B SaaS
* ERP dashboards
* Fintech back-offices



END OF ADMIN PANEL BLUEPRINT
