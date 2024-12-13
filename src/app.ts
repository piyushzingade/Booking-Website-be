import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {errorMiddleware} from './middlewares/error.js';
import { configDotenv } from 'dotenv';
import morgan from "morgan";
configDotenv();

export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

// your routes here
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/user",userRoutes);

app.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found'
  });
});

app.use(errorMiddleware);

import connectionToDb from './config/dbConnection.js';

app.listen(port, async() => {
  await connectionToDb();
  console.log('Server is working on Port:'+port+' in '+envMode+' Mode.')
});