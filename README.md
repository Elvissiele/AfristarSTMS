# Afristar ICT Helpdesk & Corporate Website

A comprehensive digital solution for **Africa Star Railway Operation Company (Afristar)**, developed by **Spyder ICT Systems Kenya**. This project integrates a robust internal Helpdesk System with a modern, responsive Corporate Website.

## 🌍 About Afristar
**Africa Star Railway Operation Company Limited** is responsible for the operation and maintenance of the Standard Gauge Railway (SGR), "Connecting Nations, Prospering People."

## 🚀 System Components

### 1. Internal Helpdesk Portal
A secure platform for Afristar staff to manage IT support requests.
*   **URL**: `http://localhost:3000/login.html`
*   **Key Features**:
    *   **RBAC**: Role-Based Access (Admin, Agent, Customer).
    *   **Secure Onboarding**: Admin-only user creation with auto-generated passwords sent via email.
    *   **Ticket Lifecycle**: Full tracking from open to closed.

### 2. Corporate Website
The public face of Afristar, featuring services, sustainability efforts, and news.
*   **URL**: `http://localhost:3000/website/index.html`
*   **Key Features**:
    *   Modern, responsive design with TailwindCSS.
    *   Dynamic content management via the Admin Dashboard.
    *   Video background hero section.

## 🛠️ Admin Dashboard (AdminJS)
*   **URL**: `http://localhost:3000/admin`
*   **Capabilities**:
    *   Manage **Users** (Staff) & **Tickets**.
    *   Update **Website Content** (dynamically change text on the public site).


## Quick Start

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL (Running locally or via Docker)

### Local Setup
1.  **Clone & Install**
    ```bash
    git clone https://github.com/Elvissiele/AfristarSTMS.git
    cd Support\ Ticket\ Management\ System
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/stms_db?schema=public"
    JWT_SECRET="your_super_secret_key"
    # Optional: Real SMTP credentials (uses Ethereal Mock by default)
    # SMTP_HOST=smtp.gmail.com ...
    ```

3.  **Database Migration**
    ```bash
    npx prisma migrate dev --name init
    # Seed default data (optional, check package.json if seed script exists)
    # node prisma/seed.js 
    ```

4.  **Run Application**
    ```bash
    npm start
    ```
    *   **Admin Panel**: `http://localhost:3000/admin`
    *   **Staff/User Portal**: `http://localhost:3000/login.html`

### Default Admin Scenarios
If seeding was run or you have an existing DB:
*   **Admin Login**: Use your admin **Email** (e.g., `admin@example.com`).
*   **Staff Login**: Use your **Staff ID** (e.g., `M1001`).

## Tech Stack

### **Backend**
*   **Node.js + Express**: Scalable API server.
*   **Prisma ORM**: Type-safe database interactions.
*   **PostgreSQL**: Reliable relational database.
*   **AdminJS**: Auto-generated admin interface.

### **Frontend**
*   **Vanilla JS + TailwindCSS**: Lightweight, fast client-side dashboard without build-step complexity.

## Deployment Using Docker
```bash
docker build -t stms-app .
docker run -p 3000:3000 --env-file .env stms-app
```

## Future Improvements
1.  **Migrate Frontend to Next.js**: For clearer component architecture.
2.  **Real-Time Updates**: Check `Socket.io` for live ticket updates.
3.  **File Attachments**: AWS S3 integration for ticket screenshots.
