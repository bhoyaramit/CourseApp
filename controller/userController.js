import {User} from "../model/User.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {sendToken} from "../utils/sendToken.js";
import { Course } from "../model/Course.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js"
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Stats } from "../model/Stats.js";


export const register = catchAsyncError(async (req,res, next)=>{

    const {name ,email , password } = req.body;
    const file = req.file;

    if(!name || !email || !password || !file) {
        return next(new ErrorHandler("Please enter all field", 400));
    }

    let user = await User.findOne({ email });
    if (user) {
        return next (new ErrorHandler("User Already Exists", 409));
    }     
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
          },
    });
    sendToken(res, user, "Registered Successfully", 201);
})

 export const login = catchAsyncError( async(req,res,next)=>{
    const {email ,password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler(" Please enter all Field ",400));
        }
    const user = await User.findOne({email}).select("+password");

    if (!user) {
        return next(new ErrorHandler("Incorrect Email And Password", 400));
    }

    const isMatched = await user.comparePassword(password);
    
    if (!isMatched) {
            return next(new ErrorHandler("Please Enter Correct password",401));
        }
    
    sendToken(res , user , `Welcome to ${user.name}` , 200);
})

export const logOut = catchAsyncError(async(req,res,next)=>{
    return res.status(200).cookie("token",null ,{
        expires:new Date(Date.now()),
        httpOnly: true,
        // secure: true,
        sameSite:"none",
    }).json({
        success:true,
        message:"User Logged Out Successfully"
    });
});


 export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
  
    res.status(200).json({
      success: true,
      user,
    });
  }); 


  export const changePassword = catchAsyncError(async(req,res,next)=>{
    
    const {oldPassword , newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please Enter All Fields",400));
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
        return next(new ErrorHandler("Incorrect Old Password ",400));
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        user,
        message:"Password Changed Successfully"
      });
  })
  
export const updateProfile = catchAsyncError(async(req,res,next)=>{

    const {name ,email  } = req.body;
    const user = await User.findById(req.user._id);
    if (name)  user.name = name;
    if (email)  user.email = email;

    await user.save();
    res.status(200).json({
        success:true,
        user,
        message:"User Profile Updated Successfully"
    });
})


 export const updateProfilePicture = catchAsyncError(async(req,res,next)=>{

    const file = req.file;
    const user = await User.findById(req.user._id);

   const fileUri = getDataUri(file);
   const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
 
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    await user.save();
    res.status(200).json({
        success:true,
        user,
        message:"User Profile Picture Updated Successfully"
    });
})

  export const forgotPassword = catchAsyncError(async(req,res,next)=>{

    const { email } = req.body;
    const user = await User.findOne({email});
    if (!user ) return next (new ErrorHandler("User Does not Exists",400));

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;
      
        // Send token via email
        await sendEmail(user.email, "CourseBundler Reset Password", message);
        res.status(200).json({
            success: true,
            message: `Reset Token has been sent to ${user.email}`,
        });
  })


   export const resetPassword = catchAsyncError( async(req,res,next)=>{
    
    const { token } = req.params;
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        },
    });

    if (!user ) return next (new ErrorHandler("Reset Token is Invalid has been Expired ",400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
await user.save();
    res.status(201).json({
        success:true,
        message:" Password Changed Successfully"
    });


  })

export const addToPlaylist = catchAsyncError( async(req,res,next)=>{
    
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    const itemExist = user.playlist.find((item)=>{
        if (item.course.toString() === course._id.toString()) return true;
});

    if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));


    user.playlist.push({
        course: course._id,
        poster: course.poster.url,
});

   await user.save();
   res.status(201).json({
    success:true,
    message: "Course Added to playlist",
});

  })

export const removeFromPlaylist = catchAsyncError( async(req,res,next)=>{

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
        if (!course) return next(new ErrorHandler("Invalid Course Id", 404));


    const newPlayList = user.playlist.filter(item => {
        if (item.course.toString() !== course._id.toString()) return item;
});

    user.playlist = newPlayList;
    await user.save();
    res.status(201).json({
    success:true,
    message: "Course Remove From User playlist",
  });
})

  
export const getAllUsers = catchAsyncError( async(req,res,next)=>{
    
    const users =  await User.find({});
    res.status(201).json({
        success:true,
        users,    
    });
  })

  export const updateUserRole = catchAsyncError( async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    if (!user ) return next (new ErrorHandler("User Does not Exists",400));

    if (user.role === "user") user.role= "admin";
    else  user.role = "user";
    
    await user.save();
    res.status(201).json({
        success:true,
        message:"User Role Updated Successfully",
        user,    
    });
  })

  export const deleteUser = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if (!user ) return next (new ErrorHandler("User Does not Exists",400));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    // cancel subscribe
    
    await user.deleteOne();

    res.status(201).json({
        success:true,
        message:"User Deleted  Successfully",
        user,    
    });
  })

  export const deleteMyProfile = catchAsyncError( async(req,res,next)=>{
    
    const user = await User.findById(req.user._id);
    if (!user ) return next (new ErrorHandler("User Does not Exists",400));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    // cancel subscribe
    
    await user.deleteOne();

    res.status(201).cookie("token", null, {
        expires: new Date(Date.now()),
      }).json({
        success:true,
        message:"User Profile Deleted  Successfully",
        user,    
    });
  })


  User.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
    const subscription = await User.find({"subscription.status":"active" });

stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
  
})