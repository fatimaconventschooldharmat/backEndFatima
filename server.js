import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import SellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudnary.js';
import addressRouter from './routes/addressRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import studentRouter from './routes/studentRoute.js';
import authRouter from './routes/authRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import teacherRouter from './routes/teacherRoute.js';
import './configs/passport.js';
const app = express();
const PORT = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();


// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
];

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// middleware configuration
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));




app.get('/', (req, res) => {
    res.send('Hello from the server!');
});
app.use('/api/user', userRouter);
app.use('/api/seller', SellerRouter);
app.use('/api/teacher', teacherRouter);

app.use('/api/address', addressRouter);

app.use('/api/student', studentRouter);
app.use('/api/notification', notificationRouter);
app.use('/auth', authRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});