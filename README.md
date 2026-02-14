# Bug Bounty Platform 🐛

A full-stack web application where companies can post bugs with bounties, and developers can submit solutions to earn rewards.

---

## 🚀 Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend

- **React** (Vite)
- **React Router** for navigation
- **Tailwind CSS** for styling

---

## ✨ Features

### User Management

- User registration with role selection (Company/Developer)
- Secure login with JWT authentication
- Role-based access control

### Bug Management

- Companies can post bugs with title, description, and bounty amount
- Public bug listing visible to all users
- Search, filter (by status), and sort (by bounty/date) functionality
- Bug status tracking: Open → In Review → Closed

### Submission System

- Developers can submit solutions with proof links
- Multiple submissions allowed per bug
- Companies can review and accept/reject submissions

### Reward System

- Automatic balance transfer on approval
- Company balance validation before bug posting
- Developer earnings tracking

---

## 📁 Project Structure

```
bug-bounty-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bugController.js
│   │   └── submissionController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bug.js
│   │   └── Submission.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bugRoutes.js
│   │   └── submissionRoutes.js
│   └── app.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Register.jsx
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CompanyAccount.jsx
    │   │   ├── BugDetail.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env file**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. **Start the server**

```bash
npm start
# or
node server.js
```

Server will run on `http://localhost:5544`

### Frontend Setup

1. **Navigate to frontend folder**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['company', 'developer']),
  balance: Number (default: 0),
  timestamps: true
}
```

### Bug Model

```javascript
{
  title: String (required),
  description: String (required),
  bounty_amount: Number (required),
  status: String (enum: ['open', 'in_review', 'closed']),
  posted_by: ObjectId (ref: User),
  winner: ObjectId (ref: User),
  timestamps: true
}
```

### Submission Model

```javascript
{
  bug_id: ObjectId (ref: Bug),
  submitted_by: ObjectId (ref: User),
  solution_description: String (required),
  proof_link: String (required),
  status: String (enum: ['pending', 'approved', 'rejected']),
  timestamps: true
}
```

---

## 📚 API Documentation

### Postman Collection

We provide a complete Postman collection for easy API testing.

**File:** `Bug_Bounty_Platform_API.postman_collection.json`

**Features:**

- ✅ 14 pre-configured endpoints
- ✅ Sample request bodies with real data
- ✅ Authorization tokens setup
- ✅ Organized in folders (Authentication, Bugs, Submissions)

**How to Import:**

1. Open Postman
2. Click **"Import"** button (top-left)
3. Upload the JSON file from project root
4. All endpoints will be ready to test!

**Base URL:** `http://localhost:5000`

**Testing Flow:**

1. **Register Company** → Get authentication token
2. **Add Balance** (₹10,000) → Enable bug posting
3. **Create Bug** with bounty (₹5,000)
4. **Register Developer** → Get developer token
5. **Submit Solution** with proof link
6. **Company: Approve Submission** → Transfer bounty
7. **Verify Balances** updated (Company: ₹5,000, Developer: ₹5,000)

---

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/add-balance` - Add balance to account (protected)

### Bugs

- `GET /api/bugs` - Get all bugs (public)
- `GET /api/bugs/:id` - Get single bug (public)
- `POST /api/bugs` - Create new bug (company only)

### Submissions

- `POST /api/bugs/submit` - Submit solution (developer only)
- `GET /api/submissions/bug/:bugId` - Get submissions for a bug
- `PUT /api/submissions/approve/:id` - Approve submission (company only)
- `PUT /api/submissions/reject/:id` - Reject submission (company only)

---

## 🎯 User Workflow

### Company Flow

1. Register/Login as Company
2. Add balance to account (via Deposit tab)
3. Post a bug with bounty amount
4. Wait for developer submissions
5. Review submissions and accept/reject
6. Bounty automatically transferred to winner

### Developer Flow

1. Register/Login as Developer
2. Browse available bugs on dashboard
3. Submit solution with proof link
4. Wait for company review
5. Earn bounty if solution approved

---

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication with expiry
- Protected routes with middleware
- Role-based access control
- Input validation and sanitization
- CORS enabled for frontend-backend communication

---

## 🧪 Testing

### Manual Testing

**Company Account Test:**

```
Email: company@example.com
Password: 123456
Role: company
Initial Balance: ₹0
```

**Developer Account Test:**

```
Email: developer@example.com
Password: 123456
Role: developer
Initial Balance: ₹0
```

### Complete Test Flow

1. **Register Company Account**
   - Navigate to `/register`
   - Enter company details
   - Select role: "Company"
   - Submit and verify success

2. **Login as Company**
   - Login with company credentials
   - Verify redirect to dashboard

3. **Add Balance**
   - Go to Account page → Deposit tab
   - Add ₹10,000
   - Verify balance updated in header

4. **Create Bug**
   - Click "ADD NEW BUG"
   - Title: "SQL Injection in Login Page"
   - Description: "Authentication bypass vulnerability"
   - Bounty: ₹5,000
   - Submit and verify bug appears in list

5. **Register Developer Account**
   - Logout from company
   - Register new developer account
   - Verify success

6. **Submit Solution**
   - Login as developer
   - Click on bug card
   - Click "Submit Solution"
   - Enter solution description and proof link
   - Submit and verify success message

7. **Approve Submission**
   - Logout and login as company
   - Navigate to bug detail page
   - Review submission
   - Click "Accept"
   - Verify bug status changed to "CLOSED"

8. **Verify Balances**
   - Company balance: ₹5,000 (decreased)
   - Developer balance: ₹5,000 (increased)
   - Bug winner: Developer name displayed

---

## 📦 Dependencies

### Backend

```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.2.1",
  "nodemon": "^3.1.11"
}
```

### Frontend

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "tailwindcss": "^3.4.10",
  "vite": "^5.4.2"
}
```

---

## 👨‍💻 Developer

**Created by:** Vishal Rathod

**Contact:** vishal11@duck.com

**GitHub:** https://github.com/vishalrathod8788/

**LinkedIn:** https://www.linkedin.com/in/rathod-vishal/
