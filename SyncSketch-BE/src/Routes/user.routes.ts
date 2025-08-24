import { Router } from 'express'
import { AuthMiddleware } from '../MiddleWares/authMiddleware.ts';
import { changePasswordController, logoutController, profileController, profileEditController, signinController, signupController } from '../Controllers/Auth.Controller.ts';


const authRoutes = Router();

// 🔑 Auth
authRoutes.post("/signup", signupController);
authRoutes.post("/signin", signinController);
authRoutes.post("/logout", AuthMiddleware, logoutController);

// 👤 User Profile
authRoutes.get("/profile", AuthMiddleware, profileController);
authRoutes.patch("/edit-profile", AuthMiddleware, profileEditController);
authRoutes.patch("/change-password", AuthMiddleware, changePasswordController);

// // 📩 OTP (Signup Verification)
// authRoutes.post("/send-otp", sendOtpController);
// authRoutes.post("/verify-otp", verifyOtpController);
// authRoutes.post("/resend-otp", resendOtpController);

// // 🔐 Password Reset (via OTP)
// authRoutes.post("/forgot-password", forgotPasswordController);
// authRoutes.post("/verify-reset-otp", verifyResetOtpController);
// authRoutes.post("/reset-password", resetPasswordController);

export default authRoutes;
