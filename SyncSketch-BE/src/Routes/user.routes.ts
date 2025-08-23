import { Router } from 'express'
import { AuthMiddleware } from '../MiddleWares/authMiddleware.ts';
import { changePasswordController, logoutController, profileController, profileEditController, signinController, signupController } from '../Controllers/Auth.Controller.ts';


const authRoutes = Router();

authRoutes.post('/signup', signupController);
authRoutes.post('/signin', signinController);
authRoutes.get('/profile', AuthMiddleware, profileController);
authRoutes.patch('/changePassword', AuthMiddleware, changePasswordController);
authRoutes.post('/logout', AuthMiddleware, logoutController);
authRoutes.patch('/editProfile', AuthMiddleware, profileEditController);


export default authRoutes;
