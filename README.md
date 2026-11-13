# 🎟️ BookMyEvent

A full-stack event booking platform built with the MERN stack. Discover events, search by category, and book tickets in a few clicks.

🔗 **Live demo:** [add link here]

![BookMyEvent Home](Untitled.png)

## ✨ Features

- User registration and login with JWT authentication
- Email OTP verification
- Event browsing, search and category filters
- Ticket booking with live availability
- Admin panel to create and manage events
- Responsive UI for mobile and desktop

## 📸 Screenshots

| Home | Event Page |
|------|------------|
| ![Home](screenshots/home.png) | ![Event](screenshots/event.png) |

| Booking | Admin Panel |
|---------|-------------|
| ![Booking](screenshots/booking.png) | ![Admin](screenshots/admin.png) |

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, Email OTP |

## 📁 Project Structure

```text
BookMyEvent/
├── client/          # React frontend
├── server/          # Express backend
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A MongoDB database (local or MongoDB Atlas)
- An email account for sending OTPs

### 1. Clone the repository

```bash
git clone https://github.com/Arham7020/BookMyEvent.git
cd BookMyEvent
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder using `.env.example` as a reference. Add your MongoDB connection string, JWT secret and email credentials.

> ⚠️ Never commit your real `.env` file to GitHub.

```bash
npm run dev
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🔐 Security

- Environment variables are kept out of version control
- Passwords and sessions are protected with JWT authentication
- Email OTP verification for accounts

## 🗺️ Roadmap

- [ ] Online payments
- [ ] Booking confirmation emails
- [ ] Deploy live demo

## 👨‍💻 Author

**Arham** · [GitHub](https://github.com/Arham7020) · [LinkedIn]([https://linkedin.com/in/yourname](https://www.linkedin.com/in/syed-arham-68b421393/))

Open to freelance projects. Feel free to reach out!

## 📄 License

MIT
