# SwiftTrack - Real-Time Order Tracking & Logistics Platform

A full-stack, enterprise-grade logistics fulfillment and order tracking platform built with Python Flask, MongoDB / JSON Fallback, Leaflet.js, JavaScript (ES6), and HTML5/CSS3.

---

## 🌟 Key Features

### Authentication & Role-Based Access Control
- **Admin Login**: Secure PIN-based authentication (`admin123`).
- **Role-Protected Routes**: Administrative endpoints for dispatch management and operations control.
- **Customer Self-Service Portal**: Zero authentication needed for real-time tracking via unique Order IDs.

### Customer Tracking & Fulfillment Module
- **Real-Time 6-Stage Milestone Tracker**: `Order Placed` → `Confirmed` → `Packed` → `Shipped` → `Out for Delivery` → `Delivered`.
- **Instant Order Cancellation**: Available exclusively during the initial `Order Placed` status.
- **Secure Auto-Generated 4-Digit Delivery OTP**: Attached to every consignment for physical handover verification.
- **Printable Order Invoices**: Detailed price breakdowns, taxes, shipping costs, and print-optimized CSS layout.
- **Dynamic Client-Side QR Code Pass**: Powered by `qrcode.js` encoding direct tracking URLs (`/?track=ORD...`).

### Geospatial Radar & Interactive Mapping
- **Zero-API-Key Interactive Routing**: Powered by Leaflet.js and OpenStreetMap.
- **Real-Time Waypoint Plotting**: Origin Warehouses (🏭), Sorting Hubs (🚚), Destination Addresses (🏠), and Live Delivery Couriers (📍) with pulsating radar animations.
- **Dynamic Polyline Route Curves**: Visual link generation between origin and destination coordinates.

### Operations & Logistics Management
- **Live Operations Counters**: Real-time stats for Total Orders, Pending/Processing, In-Transit, and Delivered.
- **Live Status Dispatcher**: Instant updates for package state and hub locations by warehouse operators.
- **Strict OTP Verification Barrier**: Deliveries cannot be marked as `Delivered` without the customer's matching 4-digit PIN.
- **Dispatch Hub Manager**: Configure active fulfillment hubs and update administrator access PINs dynamically.
- **One-Click Bulk Export**: Export order logs, timestamps, OTPs, and customer reviews into structured `.csv` files.

### Dual-Engine Intelligent Persistence
- **MongoDB Cloud & Local Support**: Connect directly via `MONGO_URI` to MongoDB Atlas or local daemon.
- **Zero-Setup Local Disk Fallback**: Automatic virtual DB with `mongomock` and JSON disk persistence (`backend/data/orders.json` & `backend/data/settings.json`) when no database server is installed.

### Post-Delivery Feedback Module
- **Automatic In-App Feedback Prompt**: Displayed immediately upon successful delivery confirmation.
- **5-Star Rating & Review System**: Qualitative comment submission stored directly in the database.

---

## 📂 Project Structure

```text
order-tracking-/
├── backend/
│   ├── app.py              # Main Flask application, REST APIs & logic
│   ├── requirements.txt    # Backend Python dependencies
│   └── data/               # Persistent disk fallback storage
│       ├── orders.json     # Serialized order entries
│       └── settings.json   # Configuration and active hub records
├── frontend/
│   ├── templates/
│   │   └── index.html      # Master SPA layout, modals, map & timeline
│   └── static/
│       ├── css/
│       │   └── style.css   # Custom warm amber styling, tokens & components
│       └── js/
│           └── app.js      # Client controller, Leaflet map engine & QR generator
├── .gitignore              # Git ignore configuration
├── LICENSE                 # Project license file
└── README.md               # Project documentation & instructions
```

---

## 💻 Installation & Setup

### Prerequisites
- Python 3.10+ installed.
- MongoDB Server (Optional; automatic local JSON persistence fallback is included out-of-the-box).

### 1. Clone / Extract Repository
Ensure you are in the project root directory:
```bash
git clone https://github.com/shyamsundarmd19-hub/order-tracking-.git
cd order-tracking-
```

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```
Or on Windows:
```powershell
py -3 -m pip install -r requirements.txt
```

### 3. Database Setup

#### Option A: MongoDB Cloud / Local Server (Production Mode)
Set the MongoDB connection string using environment variables:
```bash
export MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
```
Or for local instances:
```bash
export MONGO_URI="mongodb://localhost:27017/"
```

#### Option B: Automatic In-Memory & JSON Fallback (Development Mode)
If a local or remote MongoDB instance is not detected, the system automatically initializes a virtual database via `mongomock` paired with auto-saving JSON storage at `backend/data/orders.json` and `backend/data/settings.json`, ensuring zero data loss across server restarts without manual database installation.

### 4. Run the Application
```bash
python app.py
```
Open your browser and visit: [http://127.0.0.1:5000](http://127.0.0.1:5000/)

---

## 🌐 Live Demo

- **Repository URL**: [https://github.com/shyamsundarmd19-hub/order-tracking-](https://github.com/shyamsundarmd19-hub/order-tracking-)
- **Live Local Access**: [http://127.0.0.1:5000](http://127.0.0.1:5000/)

---

## 🔑 Default Accounts & Sample Tracking Data (Created Automatically)

| Role / Entity | Identifier | Default Password / OTP | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Administrator** | Admin Portal | `admin123` | Operations Dashboard, Status Dispatcher, Delivery Verification, Settings, CSV Export |
| **In-Transit Order** | `ORD1001` | OTP: `4821` | Live route rendering on interactive radar map, dynamic QR code pass |
| **Delivered Order** | `ORD1002` | OTP: `7392` | Completed milestone history, verified 5-star customer review display |
| **New Orders** | Auto-Generated (`ORD1003+`) | Unique 4-digit PIN | Instant placement, live tracking, order cancellation |

---

## 🔒 Security Best Practices Implemented

- **OTP Handover Verification**: Prevents unauthorized order completion by enforcing matching OTP inputs during courier delivery.
- **PIN-Protected Admin Console**: Critical state transitions and hub settings restricted behind administrative authentication.
- **CORS Negotiation**: Managed through Flask-CORS to prevent unauthorized cross-origin data extraction.
- **Client-Side Sanitization**: Input validation across forms to prevent malformed data persistence in JSON/Mongo records.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Shyam Sundar](https://github.com/shyamsundarmd19-hub)
