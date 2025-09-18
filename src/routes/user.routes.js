import { Router } from "express";
import { loginUsers, logOut, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    
    registerUser);

router.route("/login").post(loginUsers);
router.route("/logout").post(verifyJWT, logOut)



export default router;