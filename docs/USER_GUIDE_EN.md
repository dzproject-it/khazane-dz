# User Guide — Khazane-DZ

> Intelligent Stock Management Application — Sector-Agnostic

---

## Table of Contents

1. [Login](#1-login)
2. [Dashboard](#2-dashboard)
3. [Product Management](#3-product-management)
4. [Stock Movements](#4-stock-movements)
5. [Alerts](#5-alerts)
6. [Storage (Sites / Zones / Locations)](#6-storage-sites--zones--locations)
7. [Suppliers](#7-suppliers)
8. [Clients](#8-clients)
9. [Global Search](#9-global-search)
10. [Settings](#10-settings)
11. [User Management](#11-user-management)
12. [Roles and Permissions](#12-roles-and-permissions)
13. [Keyboard Shortcuts](#13-keyboard-shortcuts)

---

## 1. Login

### Accessing the Application

- **Development mode**: `http://localhost:5173`
- **Production mode**: `http://localhost:3002`
- **Desktop application**: launch from the Start menu

### Logging In

1. Enter your email address in the **Email** field
2. Enter your password in the **Password** field
3. Click **Log In**

**Default administrator account:**

| Field     | Value                |
|----------|----------------------|
| Email     | `admin@khazane.dz`   |
| Password  | `admin123`           |

> ⚠️ Change this password immediately after first login in production.

After a successful login, you are redirected to the **Dashboard**.

---

## 2. Dashboard

The dashboard is the application's home page. It displays a summary view of activity.

### Statistics Cards

Four real-time indicators are displayed at the top of the page:

| Indicator            | Description                              |
|---------------------|------------------------------------------|
| **Active Products**  | Total number of products in the system   |
| **Recent Movements** | Number of latest movements               |
| **Active Alerts**    | Triggered stock threshold alerts         |
| **Total Operations** | Overall volume of operations             |

### Quick Actions

Four buttons allow you to quickly create a stock movement:

- **Entry** (green) — Receiving goods
- **Exit** (red) — Shipping / consumption
- **Transfer** (blue) — Moving between locations
- **Adjustment** (gray) — Inventory correction

Clicking a button directly opens the movement form pre-filled with the corresponding type.

### Recent Movements

A table displays the 10 most recent stock movements with:
- Movement reference
- Type (colored badge: green/red/blue/yellow)
- Related product
- Quantity
- Date and time

---

## 3. Product Management

Accessible via the sidebar menu **Products**.

### Viewing Products

- The list displays all products paginated (20 per page)
- Use the **search bar** at the top to filter by name, SKU, or barcode
- Navigate between pages with the pagination buttons at the bottom

### Creating a Product

1. Click the **+ New Product** button
2. Fill in the form:

| Field               | Description                        | Required |
|--------------------|------------------------------------|:--------:|
| **Name**            | Product name                      | ✅       |
| **SKU**             | Unique Stock Keeping Unit code    | ✅       |
| **Category**        | Product category                  | ❌       |
| **Unit of Measure** | unit, kg, g, L, mL, m, m², m³, carton, pallet, lot | ✅ |
| **Barcode**         | EAN/UPC barcode                   | ❌       |

3. Click **Create**
4. The product appears in the list

### Importing Products (Excel/CSV)

1. Click the **Import** button (Upload icon)
2. Select an Excel (`.xlsx`) or CSV (`.csv`) file
3. The import runs automatically
4. A confirmation message shows the number of products created and updated
5. If there are errors, the number of failed rows is displayed

### Exporting Products (Excel)

1. Click the **Export** button (Download icon)
2. A file `produits-khazane.xlsx` is automatically downloaded
3. The file contains all products with their full information

---

## 4. Stock Movements

Accessible via the sidebar menu **Movements**.

### Movement Types

| Type            | Icon | Color  | Usage                                    |
|----------------|------|--------|------------------------------------------|
| **Entry**       | ↓    | Green  | Receiving, purchasing, production        |
| **Exit**        | ↑    | Red    | Shipping, consumption, sales             |
| **Transfer**    | ↔    | Blue   | Moving from one location to another      |
| **Adjustment**  | ⚙    | Yellow | Inventory correction, damage, expiry     |

### Creating a Movement

1. Click one of the **Entry**, **Exit**, or **Transfer** buttons at the top of the page
2. Fill in the form:

| Field                    | Description                          | Required  |
|-------------------------|--------------------------------------|:---------:|
| **Product**              | Select the relevant product         | ✅        |
| **Quantity**             | Number of units                     | ✅        |
| **Source Location**      | Where stock comes from (exit/transfer) | Depends |
| **Destination Location** | Where stock goes (entry/transfer)   | Depends   |
| **Supplier**              | Supplier (if type is Entry)         | ❌       |
| **Client**                | Client (if type is Exit)            | ❌       |
| **Notes**                | Free-text comment                   | ❌       |

3. Click **Validate**
4. Stock is updated automatically
5. The movement appears in the list and on the dashboard

### Viewing History

- The list displays all movements paginated (20 per page)
- Each movement shows: reference, type (colored badge), product, supplier, client, quantity, operator, date

### Stock Exit Voucher (Printable)

A printable exit voucher can be generated from the Movements page:

1. Click the **Exit Voucher** button at the top of the page
2. A formatted document is displayed with:
   - Auto-generated voucher number (`BS-YYYYMMDD-HHMM`)
   - Table of latest **Exit** type movements (reference, product, quantity)
   - Automatic **total quantity** calculation
   - Signature areas (issued by / received by / manager)
3. Click **Print** to open the browser's print dialog

> The exit voucher automatically adapts to the active language (RTL for Arabic).

---

## 5. Alerts

Accessible via the sidebar menu **Alerts**.

### How It Works

Alerts are automatically generated when a product's stock falls below a configured threshold (see [Settings > Thresholds](#stock-thresholds)).

### Alert Statuses

| Status            | Color  | Icon | Description                              |
|------------------|--------|------|------------------------------------------|
| **Triggered**     | Red    | ⚠️   | Threshold reached, action required       |
| **Acknowledged**  | Yellow | 🕐   | Taken into account, processing           |
| **Resolved**      | Green  | ✅   | Stock replenished, alert closed          |

### Displayed Information

For each alert:
- **Product** concerned
- **Current quantity** in stock
- **Threshold** configured
- **Status** with colored badge
- **Date** of trigger

---

## 6. Storage (Sites / Zones / Locations)

Accessible via the sidebar menu **Storage**.

### Storage Hierarchy

The application uses a three-level organization:

```
Site (Warehouse / Store)
  └── Zone (Aisle / Sector / Dock)
       └── Location (Shelf / Rack / Pallet)
```

### Viewing Sites

The page displays the list of storage sites with:
- **Name** of the site
- **Code** (unique, e.g.: `ENT-01`)
- **Type** (Warehouse, Store, etc.)
- **Address**

### Pre-configured Data (Seed)

| Level     | Code           | Name               | Details                       |
|-----------|----------------|--------------------|------------------------------ |
| Site      | ENT-01         | Entrepôt Principal | Zone industrielle, Alger      |
| Zone      | A1             | Allée 1            | Type AISLE                    |
| Locations | A1-01 to A1-05 | Shelf 1 to 5       | Max capacity: 100 units       |

---

## 7. Suppliers

Accessible via the sidebar menu **Suppliers**.

### Viewing Suppliers

- The list displays all suppliers paginated (20 per page)
- Use the **search bar** to filter by name, code, or contact
- Click a supplier to expand details (contact, address, NIF, linked products)

### Creating a Supplier

1. Click the **+ New Supplier** button
2. Fill in the form:

| Field              | Description                        | Required |
|-------------------|------------------------------------|:--------:|
| **Code**           | Unique supplier code               | ✅       |
| **Name**           | Company name                       | ✅       |
| **Contact**        | Contact person name                | ❌       |
| **Email**          | Email address                      | ❌       |
| **Phone**          | Phone number                       | ❌       |
| **Address**        | Postal address                     | ❌       |
| **NIF**            | Tax identification number          | ❌       |

3. Click **Create**

### Exporting Suppliers

1. Click the **Export** button (Download icon)
2. The file is automatically downloaded

### Deleting a Supplier

- Click the **Trash** icon in the supplier's row
- Confirm the deletion

---

## 8. Clients

Accessible via the sidebar menu **Clients**.

### Viewing Clients

- The list displays all clients paginated (20 per page)
- Use the **search bar** to filter by name, code, or contact
- Click a client to expand details (type, contact, address, NIF, movement count)

### Client Types

| Type              | Badge  | Description                |
|------------------|--------|----------------------------|
| **COMPANY**       | Blue   | Company / Corporation      |
| **INDIVIDUAL**    | Purple | Individual person          |
| **GOVERNMENT**    | Amber  | Government body            |
| **OTHER**         | Gray   | Other                      |

### Creating a Client

1. Click the **+ New Client** button
2. Fill in the form:

| Field              | Description                        | Required |
|-------------------|------------------------------------|:--------:|
| **Code**           | Unique client code                 | ✅       |
| **Name**           | Name or company name               | ✅       |
| **Type**           | COMPANY / INDIVIDUAL / GOVERNMENT / OTHER | ✅ |
| **Contact**        | Contact person name                | ❌       |
| **Email**          | Email address                      | ❌       |
| **Phone**          | Phone number                       | ❌       |
| **Address**        | Postal address                     | ❌       |
| **NIF**            | Tax identification number          | ❌       |

3. Click **Create**

### Exporting Clients

1. Click the **Export** button (Download icon)
2. The file is automatically downloaded

### Deleting a Client

- Click the **Trash** icon in the client's row
- Confirm the deletion

---

## 9. Global Search

### Accessing the Search

- Click the **search bar** in the top navigation bar
- Or use the keyboard shortcut **Ctrl + K**

### Usage

1. Type at least 2 characters in the search bar
2. Results appear instantly (real-time search with 300 ms debounce)
3. Results are grouped by category:

| Category        | Icon   | Searched Fields                          |
|----------------|--------|------------------------------------------|
| **Products**    | 📦     | Name, SKU, barcode                       |
| **Categories**  | 🗂️     | Name + number of associated products     |
| **Movements**   | ↔️     | Reference, type, associated product      |
| **Locations**   | 📍     | Label, code, parent zone and site        |

### Voice Search 🎤

If your browser supports voice recognition (Web Speech API):

1. A **microphone** button (🎤) appears to the right of the search bar
2. Click it to start listening (the button pulses red)
3. Speak clearly — the recognized text is automatically entered in the search bar
4. Click again to stop listening

> Compatible with Chrome, Edge, and Chromium-based browsers.

### Navigating Results

- Use the **↑** and **↓** arrow keys to navigate
- Press **Enter** to open the selected item
- Press **Escape** to close the search

---

## 10. Settings

Accessible via the sidebar menu **Settings**. The page contains 5 panels.

### Appearance (White-label)

Customize the application's look and feel:

| Option                 | Description                                         |
|-----------------------|-----------------------------------------------------|
| **Primary Color**      | 10 predefined colors + custom hue slider           |
| **Sidebar Mode**       | Light or dark                                       |
| **Application Name**   | Replace "Khazane-DZ" with your brand               |
| **Logo**               | Upload an image file (PNG, JPG, SVG or WebP — max 2 MB) |

Changes are applied immediately and saved in the browser (localStorage).

### Language

Select the interface language:

| Language  | Code | Direction |
|----------|------|-----------|
| Français  | FR   | LTR       |
| English   | EN   | LTR       |
| العربية   | AR   | RTL       |

Selecting Arabic automatically switches the interface to **right-to-left** (RTL) mode.

### User Management

The **Manage Users** button redirects to the dedicated `/users` page (see [Section 11 — User Management](#11-user-management)).

### Custom Fields

Add extra fields to product records:

1. Click **+ Add Field**
2. Fill in:
   - **Name** of the field (e.g., "Net Weight", "Supplier")
   - **Type**: TEXT (by default)
   - **Required**: yes/no
3. Click **Create**

To delete a field, click the **Trash** icon next to the field.

### Stock Thresholds

Configure alert thresholds to be notified when stock is low:

1. Click **+ Add Threshold**
2. Select the **product**
3. Set the 3 thresholds:
   - **Minimum stock** — quantity below which an alert is triggered
   - **Safety stock** — additional safety margin
   - **Reorder point** — quantity at which a replenishment order is recommended
4. Click **Create**

When a product's stock falls below the threshold, an alert is automatically triggered (visible in the **Alerts** page).

### Categories

Manage the product category tree:

1. Click **+ Add Category**
2. Enter the **name** of the category
3. Optionally select a **parent category**
4. Click **Create**

Categories support unlimited nesting (categories and subcategories).

---

## 11. User Management

Accessible via the sidebar menu **Users** (visible only for ADMIN and MANAGER roles).

### Viewing Users

The page displays a list of all users with:
- **Avatar** (colored initials)
- **Full name** and email address
- **Role** (colored badge: red ADMIN, blue MANAGER, green OPERATOR, gray VIEWER)
- **Status** (active / inactive)
- **Creation date**

### Creating a User (ADMIN only)

1. Click the **+ New User** button
2. Fill in the form:

| Field              | Description                        | Required |
|-------------------|------------------------------------|:--------:|
| **Full Name**      | First and last name               | ✅       |
| **Email**          | Unique email address              | ✅       |
| **Password**       | Minimum 6 characters              | ✅       |
| **Role**           | ADMIN / MANAGER / OPERATOR / VIEWER | ✅     |

3. Click **Create**
4. The password is automatically hashed (bcrypt) before storage

### Editing a User (ADMIN only)

1. Click the **Pencil** icon in the user's row
2. Modify the desired fields (name, email, role)
3. The password field is **optional** — leave blank to keep the existing one
4. Click **Save**

### Activating / Deactivating a User (ADMIN only)

- Click the **toggle** button in the Status column
- A deactivated user can no longer log in (verified by the JWT strategy)

### Deleting a User (ADMIN only)

- Click the **Trash** icon in the user's row
- Confirm the deletion
- The currently logged-in administrator cannot delete themselves

### Role Legend

At the bottom of the page, 4 cards describe the responsibilities of each role:

| Role         | Color  | Scope                                              |
|-------------|--------|----------------------------------------------------|
| **ADMIN**    | Red    | Full access, user management, audit, delete rights |
| **MANAGER**  | Blue   | Products, movements, suppliers, clients management |
| **OPERATOR** | Green  | Stock movement creation only                       |
| **VIEWER**   | Gray   | Read-only access                                   |

---

## 12. Roles and Permissions

The application uses a Role-Based Access Control (RBAC) system with 4 levels.

### Overview

| Role         | Description                                     | Access                                   |
|-------------|--------------------------------------------------|------------------------------------------|
| **ADMIN**    | Full administrator                              | Full access, settings, users, audit      |
| **MANAGER**  | Site manager                                    | Products, movements, alerts, suppliers, clients |
| **OPERATOR** | Stock operator                                  | Movement creation only                   |
| **VIEWER**   | Read-only                                       | Read-only access to all pages            |

### Detailed Permission Matrix by Module

| Module              | View              | Create            | Edit              | Delete            |
|--------------------|-------------------|-------------------|-------------------|-------------------|
| **Products**        | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN             |
| **Categories**      | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN             |
| **Movements**       | All authenticated | ADMIN, MANAGER, OPERATOR | —          | —                 |
| **Storage (Sites)** | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN             |
| **Alerts**          | All authenticated | —                 | ADMIN, MANAGER    | —                 |
| **Thresholds**      | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN, MANAGER    |
| **Suppliers**       | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN             |
| **Clients**         | All authenticated | ADMIN, MANAGER    | ADMIN, MANAGER    | ADMIN             |
| **Users**           | ADMIN, MANAGER    | ADMIN             | ADMIN             | ADMIN             |
| **Custom Fields**   | All authenticated | ADMIN             | ADMIN             | ADMIN             |
| **Audit (logs)**    | ADMIN             | —                 | —                 | —                 |
| **Import/Export**   | —                 | ADMIN, MANAGER    | —                 | —                 |
| **Search**          | All authenticated | —                 | —                 | —                 |
| **Stock Levels**    | All authenticated | —                 | —                 | —                 |

> **All authenticated** = ADMIN + MANAGER + OPERATOR + VIEWER (any logged-in user).

Users are assigned to one or more storage sites, limiting their scope of action.

---

## 13. Keyboard Shortcuts

| Shortcut      | Action                        |
|--------------|-------------------------------|
| **Ctrl + K**  | Open global search            |
| **↑ / ↓**     | Navigate search results       |
| **Enter**     | Open selected result          |
| **Escape**    | Close search / modal          |

---

## General Navigation

### Sidebar

The sidebar menu provides access to all sections:

| Icon | Section     | Description                          |
|------|------------|--------------------------------------|
| 📊   | Dashboard   | Activity summary view               |
| 📦   | Products    | Product catalog management          |
| 🏢   | Storage     | Sites, zones, locations             |
| ↔️    | Movements   | Movement history and creation       |
| ⚠️    | Alerts      | Stock threshold alerts              |
| 🚚   | Suppliers   | Supplier management                 |
| 👥   | Clients     | Client management                   |
| 🛡️   | Users       | User management (ADMIN/MANAGER)     |
| ⚙️    | Settings    | Application configuration           |

### Top Navigation Bar

- **Site selector**: choose the current working site
- **Global search**: search bar (or Ctrl+K)
- **Notifications**: bell icon for recent alerts
- **Profile**: access to connected account information

---

### Swagger API

Full REST API documentation is available at:

```
http://localhost:3002/api
```

It allows you to test all endpoints directly from the browser.

---

*Document generated for Khazane-DZ v0.1.0*
