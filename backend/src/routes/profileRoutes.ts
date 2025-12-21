import { Router } from "express";
import { 
  updateProfile, 
  uploadProfileImage, 
  deleteProfileImage, 
  getProfile,
  upload 
} from "../controllers/profileController";
import { authMiddleware } from "../middleware/authMiddleware";

const profileRouter = Router();

profileRouter.use(authMiddleware);

// Get current user profile
profileRouter.get("/me", getProfile);

// Update user name
profileRouter.put("/update", updateProfile);

// Upload profile image
profileRouter.post(
  "/upload-image", 
  upload.single('profileImage'), 
  uploadProfileImage
);

// Delete profile image
profileRouter.delete("/delete-image", deleteProfileImage);

export default profileRouter;