const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events')
const bookingRoutes = require('./routes/booking');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/auth',authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("Error connecting to mongoDB", error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});