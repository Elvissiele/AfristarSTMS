# Support Ticket Management System (Afristar ICT)

A robust, full-stack solution for managing customer support tickets, featuring a secure REST API and a custom admin dashboard empowered by AdminJS.

## Key Features

### 🔐 Enhanced Security & Authentication
*   **Role-Based Access Control (RBAC)**: Distinct access levels for Customers, Agents, and Admins.
*   **Secure User Onboarding**: 
    *   No public registration (Admin-only creation).
    *   **Auto-generated secure passwords** emailed to users.
    *   **Forced Password Reset**: Users must change their temporary password on first login.
*   **JWT Authentication**: Stateless and scalable.

### 🛠️ Admin Dashboard (AdminJS)
*   Manage Users, Tickets, and Comments with a GUI.
*   **User Management**: create staff accounts with auto-email notifications.
*   **Content Management**: Update dynamic website content (e.g., sustainability page text) directly from the admin panel.

### 🎫 Ticket Management
*   Complete lifecycle management (Open -> In Progress -> Resolved -> Closed).
*   Priority and Status tracking.
*   Internal notes for agents (hidden from customers).

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
