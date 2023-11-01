import jwt from "jsonwebtoken";
import { User } from "../model/User.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";




export const isAuthenticated = catchAsyncError(async( req , res , next)=>{
    
    const {token} = req.cookies;
    if (!token ) return next(new ErrorHandler("Please Login First", 401));
    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
});



export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin")
      return next(
        new ErrorHandler(
          `${req.user.role} is not allowed to access this resource`,
          403
        )
      );
  
    next();
  };
  

  
export const authorizeSubscribers = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `Only Subscriber Can Access This Resource`,
        403
      )
    );

  next();
};
