import { Response } from "express";
import { authRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/db";
import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profile-images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

export const updateProfile = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Name is required" 
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      user 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
};

export const uploadProfileImage = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    // Get current user to check if they have an existing profile image
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    });

    // Delete old profile image if it exists
    if (currentUser?.profileImage) {
      const oldImagePath = path.join(__dirname, '../../uploads/profile-images', path.basename(currentUser.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const profileImageUrl = `/uploads/profile-images/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: profileImageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Profile image uploaded successfully",
      user 
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    
    // Clean up the uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload profile image" 
    });
  }
};

export const deleteProfileImage = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    });

    if (!user?.profileImage) {
      return res.status(400).json({ 
        success: false, 
        message: "No profile image to delete" 
      });
    }

    // Delete the image file from storage
    const imagePath = path.join(__dirname, '../../uploads', user.profileImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update user profile to remove image reference
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Profile image deleted successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete profile image" 
    });
  }
};

export const getProfile = async (req: authRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile" 
    });
  }
};