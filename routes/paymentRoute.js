import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.js";
import {
    buySubscription,cancelSubscription,
    getRazorPayKey,paymentVerification,} from "../controller/paymentController.js";



//Buy Subscription
router.route("/subscribe").get(isAuthenticated, buySubscription);

// Verify Payment and save reference in database
router.route("/paymentverification").post(isAuthenticated, paymentVerification);

// Get Razorpay key
router.route("/razorpaykey").get(getRazorPayKey);

// Cancel Subscription
router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription);



export default router;
