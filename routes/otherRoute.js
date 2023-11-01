import express from "express";
import { courseRequest ,contact ,getDashboardStats } from "../controller/otherController.js";
import {isAuthenticated ,authorizeAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.route("/contact").post(contact);

// Request form
router.route("/courserequest").post(courseRequest);

// Get Admin Dashboard Stats
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getDashboardStats);

  // router
  // .route("/admin/stats")
  // .get(isAuthenticated, authorizeAdmin, getDashboardStats);
export default router;
