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
7. [Global Search](#7-global-search)
8. [Settings](#8-settings)
9. [Roles and Permissions](#9-roles-and-permissions)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)

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
| **Category**        | Product category                  | ✅       |
| **Unit of Measure** | kg, liter, piece, etc.            | ✅       |
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
| **Reference**            | Order number, receipt, etc.         | ❌        |
| **Notes**                | Free-text comment                   | ❌        |

3. Click **Validate**
4. Stock is updated automatically
5. The movement appears in the list and on the dashboard

### Viewing History

- The list displays all movements paginated (20 per page)
- Each movement shows: reference, type (colored badge), product, quantity, date

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

## 7. Global Search

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

### Navigating Results

- Use the **↑** and **↓** arrow keys to navigate
- Press **Enter** to open the selected item
- Press **Escape** to close the search

---

## 8. Settings

Accessible via the sidebar menu **Settings**. The page contains 5 panels.

### Appearance (White-label)

Customize the application's look and feel:

| Option                 | Description                                         |
|-----------------------|-----------------------------------------------------|
| **Primary Color**      | 10 predefined colors + custom hue slider           |
| **Sidebar Mode**       | Light or dark                                       |
| **Application Name**   | Replace "Khazane-DZ" with your brand               |
| **Logo URL**           | URL to your custom logo                            |

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

- **View** the list of users with their role and email
- Each user displays a colored badge based on their role:

| Role         | Badge  |
|-------------|--------|
| ADMIN        | Red    |
| MANAGER      | Blue   |
| OPERATOR     | Green  |
| VIEWER       | Gray   |

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
3. Set the **minimum quantity**
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

## 9. Roles and Permissions

The application uses a Role-Based Access Control (RBAC) system with 4 levels:

| Role         | Description                                     | Access                                   |
|-------------|--------------------------------------------------|------------------------------------------|
| **ADMIN**    | Full administrator                              | Full access, settings, user management   |
| **MANAGER**  | Site manager                                    | Products, movements, alerts management   |
| **OPERATOR** | Stock operator                                  | Movement creation, read access           |
| **VIEWER**   | Read-only                                       | Read-only access to all pages            |

Users are assigned to one or more storage sites, limiting their scope of action.

---

## 10. Keyboard Shortcuts

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
| ↔️    | Movements   | Movement history and creation       |
| ⚠️    | Alerts      | Stock threshold alerts              |
| 🏢   | Storage     | Sites, zones, locations             |
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
