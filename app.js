import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middlewares/Error.js";
import cors from "cors";

const app = express();
config({path: "./config/config.env"});
 
// Using Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  
// Importing & Using Routes
import  user  from "./routes/userRoute.js";
app.use("/api/v1",user);

import course from "./routes/courseRoute.js";
app.use("/api/v1",course);

import payment from "./routes/paymentRoute.js";
app.use("/api/v1",payment);

import other from "./routes/otherRoute.js";
app.use("/api/v1",other);



export default app;

app.get("/", (req, res) =>
  res.send(
    `<h1>Site is Working. click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`
  )
);

app.use(ErrorMiddleware);