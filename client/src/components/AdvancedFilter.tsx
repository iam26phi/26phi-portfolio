import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";

export type FilterOptions = {
  category: "All" | "Portrait" | "Travel" | "Editorial";
  location: string;
  year: string;
};

type AdvancedFilterProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableLocations: string[];
  availableYears: string[];
};

export function AdvancedFilter({
  filters,
  onFiltersChange,
  availableLocations,
  availableYears,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      category: "All",
      location: "All",
      year: "All",
    });
  };

  const activeFiltersCount = [
    filters.category !== "All",
    filters.location !== "All",
    filters.year !== "All",
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          進階篩選
          {activeFiltersCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>進階篩選</span>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2"
              >
                <X className="mr-1 h-4 w-4" />
                清除全部
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">作品分類</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value as FilterOptions["category"] })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">全部</SelectItem>
                <SelectItem value="Portrait">人物肖像</SelectItem>
                <SelectItem value="Travel">旅遊攝影</SelectItem>
                <SelectItem value="Editorial">編輯攝影</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location">拍攝地點</Label>
            <Select
              value={filters.location}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, location: value })
              }
            >
              <SelectTrigger id="location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">全部地點</SelectItem>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <Label htmlFor="year">拍攝年份</Label>
            <Select
              value={filters.year}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, year: value })
              }
            >
              <SelectTrigger id="year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">全部年份</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-6 border-t space-y-3">
              <p className="text-sm font-medium">目前篩選條件：</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                {filters.category !== "All" && (
                  <div className="flex items-center justify-between">
                    <span>分類</span>
                    <span className="font-medium text-foreground">{filters.category}</span>
                  </div>
                )}
                {filters.location !== "All" && (
                  <div className="flex items-center justify-between">
                    <span>地點</span>
                    <span className="font-medium text-foreground">{filters.location}</span>
                  </div>
                )}
                {filters.year !== "All" && (
                  <div className="flex items-center justify-between">
                    <span>年份</span>
                    <span className="font-medium text-foreground">{filters.year}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
