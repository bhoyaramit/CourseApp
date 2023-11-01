import express from "express";

import { addToPlaylist, changePassword, forgotPassword, getMyProfile, logOut, login, register, 
    removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture ,getAllUsers ,deleteMyProfile,deleteUser ,updateUserRole } from "../controller/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// To register a new user
router.route("/register").post(singleUpload, register);
// Login
router.route("/login").post(login);
// logout
router.route("/logout").get(logOut);
// Get my profile
router.route("/me").get(isAuthenticated, getMyProfile);


router.route("/changepassword").put(isAuthenticated,changePassword);
router.route("/updateprofile").put(isAuthenticated , singleUpload , updateProfile);
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload ,updateProfilePicture);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").put(resetPassword);


// AddtoPlaylist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);
// RemoveFromPlaylist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

// Admin Routes
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);

router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser);


// Delete my profile
router.route("/me").delete(isAuthenticated, deleteMyProfile);



export default router;