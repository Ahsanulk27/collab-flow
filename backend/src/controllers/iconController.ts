/**
 * Icon Controller - Backend API for icon metadata
 */

import { Request, Response } from "express";

// Icon categories
export const IconCategory = {
  NAVIGATION: "navigation",
  WORKSPACE: "workspace",
  COMMUNICATION: "communication",
  USER: "user",
  ACTIONS: "actions",
  TASK: "task",
  ANALYTICS: "analytics",
  MEDIA: "media",
  UI: "ui",
  STATUS: "status",
  BRAND: "brand",
} as const;

// Icon registry (matches frontend)
// In a real app, you might want to store this in a database
const iconRegistry: Array<{
  name: string;
  category: string;
  keywords: string[];
  description?: string;
}> = [
  // Navigation & Layout
  {
    name: "home",
    category: IconCategory.NAVIGATION,
    keywords: ["home", "dashboard", "main", "index"],
    description: "Navigate to home page",
  },
  {
    name: "layout",
    category: IconCategory.NAVIGATION,
    keywords: ["layout", "grid", "view", "all"],
    description: "View all workspaces",
  },
  {
    name: "search",
    category: IconCategory.NAVIGATION,
    keywords: ["search", "find", "query"],
  },
  {
    name: "arrowLeft",
    category: IconCategory.NAVIGATION,
    keywords: ["arrow", "left", "back", "previous"],
  },
  {
    name: "arrowRight",
    category: IconCategory.NAVIGATION,
    keywords: ["arrow", "right", "next", "forward"],
  },
  // Workspace & Files
  {
    name: "folderPlus",
    category: IconCategory.WORKSPACE,
    keywords: ["folder", "add", "create", "workspace", "new"],
    description: "Create new workspace",
  },
  {
    name: "briefcase",
    category: IconCategory.WORKSPACE,
    keywords: ["briefcase", "work", "business", "workspace"],
  },
  // Communication
  {
    name: "messageCircle",
    category: IconCategory.COMMUNICATION,
    keywords: ["message", "chat", "comment", "discuss"],
    description: "Open chat",
  },
  {
    name: "send",
    category: IconCategory.COMMUNICATION,
    keywords: ["send", "message", "submit"],
  },
  {
    name: "paperclip",
    category: IconCategory.COMMUNICATION,
    keywords: ["attachment", "file", "attach"],
  },
  // User & Profile
  {
    name: "user",
    category: IconCategory.USER,
    keywords: ["user", "profile", "account", "person"],
    description: "View profile",
  },
  {
    name: "users",
    category: IconCategory.USER,
    keywords: ["users", "team", "members", "people"],
  },
  {
    name: "userPlus",
    category: IconCategory.USER,
    keywords: ["add", "user", "invite", "member"],
  },
  {
    name: "logOut",
    category: IconCategory.USER,
    keywords: ["logout", "signout", "exit"],
  },
  // Actions
  {
    name: "plus",
    category: IconCategory.ACTIONS,
    keywords: ["add", "create", "new", "plus"],
  },
  {
    name: "edit",
    category: IconCategory.ACTIONS,
    keywords: ["edit", "modify", "update"],
  },
  {
    name: "trash2",
    category: IconCategory.ACTIONS,
    keywords: ["delete", "remove", "trash"],
  },
  {
    name: "x",
    category: IconCategory.ACTIONS,
    keywords: ["close", "cancel", "dismiss"],
  },
  {
    name: "loader2",
    category: IconCategory.ACTIONS,
    keywords: ["loading", "spinner", "wait"],
  },
  // Task & Kanban
  {
    name: "kanbanSquare",
    category: IconCategory.TASK,
    keywords: ["kanban", "board", "tasks", "project"],
    description: "View task board",
  },
  {
    name: "penTool",
    category: IconCategory.TASK,
    keywords: ["pen", "draw", "whiteboard", "sketch"],
    description: "Open whiteboard",
  },
  // Analytics
  {
    name: "barChart3",
    category: IconCategory.ANALYTICS,
    keywords: ["chart", "analytics", "stats", "data"],
    description: "View analytics",
  },
  // Media
  {
    name: "video",
    category: IconCategory.MEDIA,
    keywords: ["video", "camera", "record"],
  },
  // Brand & Features
  {
    name: "zap",
    category: IconCategory.BRAND,
    keywords: ["lightning", "fast", "power"],
  },
  {
    name: "infinity",
    category: IconCategory.BRAND,
    keywords: ["unlimited", "endless", "infinite"],
  },
  {
    name: "shield",
    category: IconCategory.BRAND,
    keywords: ["security", "protection", "safe"],
  },
  {
    name: "sparkles",
    category: IconCategory.BRAND,
    keywords: ["sparkle", "magic", "premium"],
  },
  {
    name: "target",
    category: IconCategory.BRAND,
    keywords: ["target", "goal", "aim"],
  },
  {
    name: "palette",
    category: IconCategory.BRAND,
    keywords: ["color", "design", "theme"],
  },
  {
    name: "code",
    category: IconCategory.BRAND,
    keywords: ["code", "developer", "programming"],
  },
];

/**
 * Search icons
 * GET /api/v1/icons/search?query=home&category=navigation&limit=10
 */
export const searchIcons = async (req: Request, res: Response) => {
  try {
    const { query, category, limit } = req.query;

    let results = [...iconRegistry];

    // Filter by category
    if (category && typeof category === "string") {
      results = results.filter((icon) => icon.category === category);
    }

    // Search by query
    if (query && typeof query === "string") {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (icon) =>
          icon.name.toLowerCase().includes(lowerQuery) ||
          icon.keywords.some((keyword) => keyword.includes(lowerQuery)) ||
          icon.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply limit
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    if (limitNum && limitNum > 0) {
      results = results.slice(0, limitNum);
    }

    res.json({
      icons: results,
      total: results.length,
    });
  } catch (error) {
    console.error("Error searching icons:", error);
    res.status(500).json({ error: "Failed to search icons" });
  }
};

/**
 * Get icon metadata by name
 * GET /api/v1/icons/:iconName
 */
export const getIconMetadata = async (req: Request, res: Response) => {
  try {
    const { iconName } = req.params;
    const icon = iconRegistry.find(
      (i) => i.name.toLowerCase() === iconName.toLowerCase()
    );

    if (!icon) {
      return res.status(404).json({ error: "Icon not found" });
    }

    res.json(icon);
  } catch (error) {
    console.error("Error getting icon metadata:", error);
    res.status(500).json({ error: "Failed to get icon metadata" });
  }
};

/**
 * Get all categories
 * GET /api/v1/icons/categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = Object.values(IconCategory);
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
};

/**
 * Get icons by category
 * GET /api/v1/icons/category/:category
 */
export const getIconsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const icons = iconRegistry.filter(
      (icon) => icon.category === category
    );

    res.json({
      icons,
      total: icons.length,
    });
  } catch (error) {
    console.error("Error getting icons by category:", error);
    res.status(500).json({ error: "Failed to get icons by category" });
  }
};

/**
 * Get all icons
 * GET /api/v1/icons
 */
export const getAllIcons = async (req: Request, res: Response) => {
  try {
    res.json({
      icons: iconRegistry,
      total: iconRegistry.length,
    });
  } catch (error) {
    console.error("Error getting all icons:", error);
    res.status(500).json({ error: "Failed to get icons" });
  }
};

