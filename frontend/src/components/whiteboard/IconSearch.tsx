import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Icon } from "@iconify/react";
import axios from "axios";

interface IconSearchProps {
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
}

const ICONIFY_API = "https://api.iconify.design";

export const IconSearch = ({ onSelectIcon, onClose }: IconSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [icons, setIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Search icons from Iconify API
  const searchIcons = async (query: string) => {
    if (!query.trim()) {
      setIcons([]);
      return;
    }

    setLoading(true);
    try {
      // Search for icons using Iconify API
      const response = await axios.get(
        `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&limit=48`
      );

      if (response.data && response.data.icons) {
        setIcons(response.data.icons);
      } else {
        setIcons([]);
      }
    } catch (error) {
      console.error("Failed to search icons", error);
      setIcons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchIcons(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 z-20 w-[500px] max-h-[600px] flex flex-col border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Search Icons</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search icons (e.g., home, user, star, heart)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading icons...</div>
        ) : icons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No icons found. Try a different search term." : "Start typing to search for icons"}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {icons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelectIcon(iconName)}
                className="p-3 border rounded-lg hover:bg-muted transition-colors flex items-center justify-center aspect-square"
                title={iconName}
              >
                <Icon icon={iconName} width={24} height={24} />
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        Powered by <a href="https://iconify.design" target="_blank" rel="noopener noreferrer" className="underline">Iconify</a>
      </div>
    </div>
  );
};

