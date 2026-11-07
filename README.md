# 🎟️ BookMyEvent

A full-stack event booking platform built with the MERN stack.

BookMyEvent is a project I'm building to make discovering and booking events easier. It includes user authentication, email OTP verification and an admin panel, with a focus on creating a smooth and simple experience.

## ✨ Features

- User registration and login
- Email OTP verification
- JWT-based authentication
- Event browsing and booking
- Admin panel
- Responsive user interface

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## 📁 Project Structure

```text
EVENT BOOKING V2/
├── client/          # React frontend
├── server/          # Express backend
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Event-Booking-System.git
cd Event-Booking-System
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` folder using `.env.example` as a reference.

Add your own MongoDB connection string, JWT secret and email credentials.

**Never commit your actual `.env` file to GitHub.**

### 4. Start the backend

```bash
npm run dev
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The application should now be available at:

```text
http://localhost:5173
```

## 🔐 Security

- Environment variables are kept out of version control.
- Authentication is handled using JWT.
- Email verification uses OTP.

## 📌 Project Status

This project is under active development. New features, improvements and fixes are being added as development continues.

## 👨‍💻 Developer

Built with ❤️ while learning and exploring full-stack web development.

**BookMyEvent — Making event booking simpler.**
