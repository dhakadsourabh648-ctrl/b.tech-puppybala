# B.tech Puppybala 🐾
### Premium Customer-Facing Website & MongoDB Backend System (Part 1 & Part 2)

**B.tech Puppybala** is an ethical, home-based puppy business operating from **Bhopal, Madhya Pradesh** and serving pet parents across Bhopal, Indore, Sehore, Vidisha, Raisen, Mandideep, and nearby MP cities.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, React Router 7, Lucide React
- **Backend**: Node.js, Express 5, CORS, Morgan, Dotenv
- **Database**: MongoDB with Mongoose 9 (supports Local MongoDB and MongoDB Atlas, with resilient dev fallback)
- **Authentication Foundation**: JSON Web Tokens (JWT) + Bcryptjs for admin foundation

---

## 📁 Architecture & Clean Folder Structure

```
pet/
├── .env                  # Environment variables (configured for local dev)
├── .env.example          # Template for environment variables
├── index.html            # Main HTML document with Google Fonts & SEO tags
├── package.json          # Root scripts for client, server, and fullstack
├── server/               # Backend Application
│   ├── config/
│   │   ├── db.js         # Mongoose connection & status tracking
│   │   └── env.js        # Centralized environment config
│   ├── controllers/
│   │   ├── puppyController.js  # REST controllers for puppy CRUD & availability
│   │   ├── adminController.js  # Admin auth & profile controllers
│   │   └── offerController.js  # Dynamic promotion controllers
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect & adminOnly guards
│   │   ├── errorMiddleware.js  # Centralized error & 404 handler
│   │   └── validateMiddleware.js # Payload validation (no vaccinationStatus)
│   ├── models/
│   │   ├── Puppy.js      # Puppy schema (name, breed, age, gender, price, description, images, availability)
│   │   ├── Admin.js      # Admin schema with bcrypt password hashing
│   │   └── Offer.js      # Dynamic Welcome Kit offers model
│   ├── routes/
│   │   ├── puppyRoutes.js# REST routes for /api/puppies
│   │   ├── adminRoutes.js# Routes for /api/admin/login and /api/admin/me
│   │   └── offerRoutes.js# Routes for /api/offers
│   ├── seeds/
│   │   ├── seedData.js   # 12 realistic demo puppies + default admin + offer
│   │   └── seed.js       # Database seeder script
│   └── server.js         # Main Express application entry point
└── src/                  # Frontend Application
    ├── components/       # Reusable UI components (Navbar, Footer, PuppyCard, OffersBanner, TrustSection, HowItWorks, EnquiryForm, EnquiryModal)
    ├── data/             # Local data models & fallback cache
    ├── pages/            # HomePage, PuppiesPage, PuppyDetailsPage, AboutPage, ContactPage
    ├── services/
    │   └── api.js        # Frontend API client connecting public UI to backend REST APIs
    └── index.css         # Tailwind CSS directives & custom styling
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
The project comes pre-configured with a `.env` file. You can adjust the `MONGODB_URI` if using MongoDB Atlas:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/btech_puppybala
JWT_SECRET=btech_puppybala_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Running the Project

#### Option A: Run Both Backend & Frontend Together (Recommended)
```bash
npm run dev
```
*(Runs backend server on port 5000 and Vite frontend on port 5173 concurrently).*

#### Option B: Run Individually in Separate Terminals
- **Terminal 1 (Backend Server)**:
  ```bash
  npm run server
  ```
- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run client
  ```

---

## 🐶 Database Seeding

To populate MongoDB with at least 10 realistic demo puppies:
```bash
npm run seed
```
To drop existing records and re-seed freshly:
```bash
npm run seed:force
```

Admin Account:
- **Email**: `dhakadsourabh648@gmail.com`
- **Password**: *(Configured secure admin password)*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/puppies` | Get all puppies (supports `breed`, `gender`, `availability`, `search`, `sort`) | Public |
| `GET` | `/api/puppies/:id` | Get single puppy by ID | Public |
| `POST` | `/api/puppies` | Create a new puppy record | Admin |
| `PUT` | `/api/puppies/:id` | Update puppy details | Admin |
| `DELETE` | `/api/puppies/:id` | Delete a puppy record | Admin |
| `PATCH` | `/api/puppies/:id/availability` | Update puppy status (`Available` / `Sold`) | Admin |
| `GET` | `/api/offers` | Get active Welcome Kit promotions | Public |
| `GET` | `/api/offers/admin` | Get all offers (Active & Inactive) | Admin |
| `POST` | `/api/offers` | Create a promotional offer | Admin |
| `PUT` | `/api/offers/:id` | Update promotional offer | Admin |
| `PATCH` | `/api/offers/:id/status` | Instant activate / deactivate toggle | Admin |
| `DELETE` | `/api/offers/:id` | Delete an offer record | Admin |
| `POST` | `/api/inquiries` | Submit customer puppy enquiry (Triggers WhatsApp auto-notification) | Public |
| `GET` | `/api/inquiries` | Get all customer enquiries with WhatsApp delivery status | Admin |
| `GET` | `/api/inquiries/:id` | Get single enquiry details | Admin |
| `PATCH` | `/api/inquiries/:id/status` | Update enquiry status (`New`, `Contacted`, `Follow-up`, `Closed`) | Admin |
| `POST` | `/api/inquiries/:id/resend-whatsapp` | Re-send automated WhatsApp thank-you message | Admin |
| `GET` | `/api/inquiries/whatsapp/status` | WhatsApp Cloud API service diagnostics | Admin |
| `DELETE` | `/api/inquiries/:id` | Delete an enquiry record | Admin |
| `POST` | `/api/admin/login` | Admin login & receive JWT token | Public |
| `GET` | `/api/admin/me` | Get authenticated admin profile | Protected (JWT) |
| `GET` | `/api/admin/dashboard` | Admin dashboard overview metrics | Protected (JWT) |
| `GET` | `/api/health` | Health check & MongoDB status | Public |

---

## 📱 WhatsApp Business Cloud API Integration (Part 6)

### Customer Flow:
1. Customer submits puppy enquiry.
2. Backend validates data and saves enquiry to MongoDB.
3. Automatically triggers WhatsApp thank-you notification via official Meta WhatsApp Business Cloud API architecture (`https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages`).
4. In local development or when credentials are missing, system seamlessly runs in **Safe Mock Development Mode** (simulating and logging message dispatches with zero website failure).
5. Delivery status (`Pending`, `Sent`, `Failed`), message ID (`wamid...`), and timestamps are recorded in the Inquiry model.
6. The Admin Panel displays delivery badges on each enquiry and provides 1-click **Resend** capability. Deduplication prevents accidental duplicate sends on retries.

### Thank-You Message Template:
> *"Thank you for contacting B.tech Puppybala! 🐶\n\nWe have received your enquiry successfully.\nOur team will contact you shortly regarding your puppy enquiry.\n\nThank you for choosing B.tech Puppybala."*

---

## 🔒 Security & Best Practices
- 🛡️ **Zero Credential Exposure**: WhatsApp access tokens, phone number IDs, and JWT secrets are strictly stored in `.env` and never bundled in client code.
- 🛡️ **Resilient Delivery**: If WhatsApp API or network connectivity is unavailable, the customer's enquiry is ALWAYS saved safely, returning HTTP 201 to the customer without disruption.
- 🛡️ **Deduplication Protection**: Retried submissions avoid duplicate WhatsApp messages.

