import express from "express";
import { getAllCourse ,createCourse ,addLecture , deleteCourse , deleteLecture , getCourseLectures} from "../controller/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated ,authorizeSubscribers } from "../middlewares/auth.js";

const router = express.Router();


 // Get All courses without lectures
router.route("/courses").get(getAllCourse);

// create new course - only admin
router.route("/createcourse").post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

 // Add lecture, Delete Course, Get Course Details

router.route("/course/:id").post(isAuthenticated , authorizeAdmin , singleUpload,addLecture);

router.route("/course/:id").get(isAuthenticated , authorizeSubscribers , getCourseLectures);

router.route("/course/:id").delete(isAuthenticated , authorizeAdmin , deleteCourse);

 // Delete Lecture
 router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);


export default router;
