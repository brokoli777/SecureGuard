import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Flame,
  Shield,
  HelpCircle,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function EventLogDashboard({
  onSearch,
  onDateFilter,
  onCategoryFilter,
  resetFilters,
}) {
  const [active, setActive] = useState(null);

  const filters = [
    {
      label: "Person",
      icon: User,
    },
    {
      label: "Fire",
      icon: Flame,
    },
    {
      label: "Weapon",
      icon: Shield,
      filterValue: "Gun",
    },
    {
      label: "Unrecognized",
      icon: HelpCircle,
      isUnrecognized: true,
    },
  ];

  const handleFilterClick = (filter) => {
    setActive(filter.label);
    if (filter.isUnrecognized) {
      onCategoryFilter("person", "N/A");
    } else {
      onCategoryFilter(filter.filterValue || filter.label);
    }
  };

  return (
    <Card className="w-full p-6">
      <CardContent className="p-0 space-y-6">
        {/* Search input */}
        <div>
          <h2 className="text-2xl mb-3 font-semibold">Search Events</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by category or name..."
              className="w-full pl-10"
              onChange={(e) => onSearch(e.target.value)} // Trigger search on input change
            />
          </div>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold">Filters</h2>
            {/* Filter Buttons */}
            <Button
              variant="secondary"
              onClick={() => {
                setActive(null);
                resetFilters();
              }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <Input
                type="date"
                id="filter-date"
                onChange={(e) => onDateFilter(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            {filters.map((filter) => (
              <Button
                key={filter.label}
                variant={active === filter.label ? "default" : "secondary"}
                className="flex-1"
                onClick={() => handleFilterClick(filter)}>
                <filter.icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
