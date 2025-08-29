import { Router } from 'express'
import { AuthMiddleware } from '../MiddleWares/authMiddleware.ts';
import { 
    changePasswordController, 
    logoutController, 
    profileController, 
    profileEditController, 
    signinController, 
    signupController,
    requestSignupOtpController,
    completeSignupController,
    requestPasswordResetController,
    resetPasswordController
} from '../Controllers/auth.Controller.ts';


const authRoutes = Router();

// 🔑 Auth - Two-Step Signup Flow
authRoutes.post("/signup/request-otp", requestSignupOtpController);  // Step 1: Request OTP
authRoutes.post("/signup/complete", completeSignupController);        // Step 2: Verify OTP & Complete Signup
authRoutes.post("/signup", signupController);                         // Legacy: Direct signup (no OTP)

// 🔑 Auth - Signin & Logout
authRoutes.post("/signin", signinController);
authRoutes.post("/logout", AuthMiddleware, logoutController);

// 👤 User Profile
authRoutes.get("/profile", AuthMiddleware, profileController);
authRoutes.patch("/editProfile", AuthMiddleware, profileEditController);
authRoutes.patch("/changePassword", AuthMiddleware, changePasswordController);

// 🔐 Password Reset Flow
authRoutes.post("/forgotPassword", requestPasswordResetController);  // Request password reset OTP
authRoutes.post("/resetPassword", resetPasswordController);          // Verify OTP & reset password

export default authRoutes;
