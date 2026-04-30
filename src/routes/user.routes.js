import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, getCurrentUser, updateCurrentUser, updateCurrentUserAvatar, updateCurrentUserCoverImage, deleteCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
//middleware

router.route("/register").post(upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-access-token").get(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-current-user").put(verifyJWT, updateCurrentUser);
router.route("/update-current-user-avatar").put(verifyJWT, upload.single("avatar"), updateCurrentUserAvatar);
router.route("/update-current-user-cover-image").put(verifyJWT, upload.single("coverImage"), updateCurrentUserCoverImage);
router.route("/delete-current-user").delete(verifyJWT, deleteCurrentUser);
export default router;