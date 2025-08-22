import { Router } from 'express'
import { AuthMiddleware } from '../MiddleWares/authMiddleware.ts';
import { signinController, signupController } from '../Controllers/Auth.Controller.ts';


const authRoutes = Router();

authRoutes.post('/signup', signupController);
authRoutes.post('/signin', signinController);

export default authRoutes;
