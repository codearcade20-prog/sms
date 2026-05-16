# ProPulse - Smart Productivity & Task Management System

ProPulse is a premium employee management platform designed to improve accountability and engagement through a point-based performance system.

## 🚀 Key Features
- **Centralized Dashboard**: Real-time productivity analytics and task tracking.
- **Gamified Performance**: Earn points for completing tasks on time.
- **Role-Based Access**: Specialized interfaces for MD, Admin, Seniors, and Juniors.
- **Admin Approval**: Secure signup flow with administrative oversight.
- **Dynamic Leaderboard**: Visual ranking of top-performing employees.

## 🛠 Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL with Prisma ORM.

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL Database

### Setup Instructions

1. **Clone/Download** the project.
2. **Server Setup**:
   ```bash
   cd server
   npm install
   # Configure .env with your DATABASE_URL and JWT_SECRET
   npx prisma generate
   # npx prisma migrate dev --name init (if db is ready)
   npm start
   ```
3. **Client Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🏗 Project Structure
- `/client`: React application with premium UI.
- `/server`: Express API with Prisma integration.
- `implementation_plan.md`: Detailed roadmap.
