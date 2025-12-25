/**
 * Icon Routes - API endpoints for icon management
 */

import { Router } from "express";
import {
  searchIcons,
  getIconMetadata,
  getCategories,
  getIconsByCategory,
  getAllIcons,
} from "../controllers/iconController";

const iconRouter = Router();

// Public routes (no authentication required for icon metadata)
iconRouter.get("/", getAllIcons);
iconRouter.get("/search", searchIcons);
iconRouter.get("/categories", getCategories);
iconRouter.get("/category/:category", getIconsByCategory);
iconRouter.get("/:iconName", getIconMetadata);

export default iconRouter;

