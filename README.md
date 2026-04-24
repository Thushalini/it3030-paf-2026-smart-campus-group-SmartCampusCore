# it3030-paf-2026-smart-campus-group-CampusOps-Hub

# 🎓 Smart Campus – University Management Dashboard

A modern **University Management System Dashboard** built with React.  
It helps manage university operations like resources, bookings, users, and administration with a clean and intuitive UI/UX.

---

## 🚀 Features

- 🔐 Authentication system (Login / Signup / Forgot Password)
- 👨‍🎓 Role-based access control (Student / Staff / Admin)
- 📊 Interactive dashboard with analytics overview
- 🏫 Resource management (labs, rooms, equipment)
- 📅 Booking and scheduling system
- 👥 User management (Admin panel)
- 📁 Profile management
- 🔔 Real-time notifications
- 📱 Fully responsive UI design
- ⚡ Fast React-based architecture

---

## 🛠️ Tech Stack

- React.js
- React Router DOM
- Context API (State Management)
- Axios (API Calls)
- CSS / Tailwind CSS (Styling)
- Framer Motion (Animations)
- JWT Authentication / OAuth (Google Login)

---

## 📂 Project Structure
src/
│── api/ # API service files
│── components/ # Reusable UI components
│── context/ # Authentication & global state
│── layouts/ # Layout components
│── pages/ # Application pages (Dashboard, Login, etc.)
│── routes/ # Private & public routes
│── styles/ # CSS files
│── App.js
│── main.jsx


---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Thushalini/it3030-paf-2026-smart-campus-group-SmartCampusCore.git
cd it3030-paf-2026-smart-campus-group-SmartCampusCore
```

### install dependencies
```
npm install
```

### Environment Variables
Create a .env file in the root directory
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### frontend run
```
npm run dev
```

### backend run
```
.\mvnw.cmd spring-boot:run
```


### 👤 User Roles
## 🧑‍💼 Admin
- Manage users
- Manage resources
- View system analytics
## 👨‍🏫 Staff
- Manage bookings
- Handle assigned resources
## 🎓 Student
- Book resources
- View schedules
- Manage profile
