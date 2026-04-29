# it3030-paf-2026-smart-campus-group-SmartCampusCore

# 🎓 Smart Campus Core – University Management

A modern **University Management System ** built with React.  
It helps manage university operations like resources, bookings, users, raising tickets, recieving real time notifications and administration with a clean and intuitive UI/UX.

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
- 🎫 Full ticket lifecycle management – Users can create tickets with up to 3 image attachments, assign technicians, track status (OPEN → IN_PROGRESS → RESOLVED → CLOSED / REJECTED), and add/edit/delete comments with role‑based ownership rules.
- ⌛ Priority‑based SLA monitoring – Real‑time tracking of time‑to‑first‑response and time‑to‑resolution with per‑priority targets (CRITICAL: 60min/4h, HIGH: 4h/24h, MEDIUM: 8h/48h, LOW: 24h/5d), live count‑up timer, and visual breach alerts on admin/technician dashboards.
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

Add this in application.properties
```
spring.data.mongodb.uri={MONGODB_URI}
spring.security.oauth2.client.registration.google.client-id = {GOOGLE_CLIENT_ID}
jwt.secret=myverysecuresecretkey_that_is_at_least_32_bytes!
spring.data.mongodb.database={DATABASE_NAME}

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
- Manage Notifications and send broadcast notifications
- View real time notifications
- Manage resources
- Manage bookings
- Manage tickets and comments
- View system analytics
- Manage profile
## 👨‍🏫 Technician
- Resolving ticket issues
- View real time notifications
- Comment tickets
- Manage profile
## 🎓 Student
- View resources
- Book resources
- View real time notifications
- Raise tickets
- Manage profile
