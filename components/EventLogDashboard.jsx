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
  const [dateValue, setDateValue] = useState("");

  const filters = [
    { label: "Person", icon: User },
    { label: "Fire", icon: Flame },
    { label: "Weapon", icon: Shield, filterValue: "Gun" },
    { label: "Unrecognized", icon: HelpCircle, isUnrecognized: true },
  ];

  const handleReset = () => {
    setActive(null);
    setDateValue("");
    resetFilters();
  };

  return (
    <Card className="w-full p-4">
      <CardContent className="p-0 space-y-4">
        {/* Search input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Search Events</h2>
            <Button variant="ghost" size="sm" o onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
          <h2 className="text-xl font-semibold mb-2">Filters</h2>
          <div className="grid grid-cols-5 gap-3">
            <Input
              type="date"
              id="filter-date"
              value={dateValue}
              onChange={(e) => {
                setDateValue(e.target.value);
                onDateFilter(e.target.value);
              }}
            />
            {/* Filter Buttons */}
            {filters.map((filter) => (
              <Button
                key={filter.label}
                variant={active === filter.label ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  setActive(filter.label);
                  if (filter.isUnrecognized) {
                    onCategoryFilter("person", "N/A");
                  } else {
                    onCategoryFilter(filter.filterValue || filter.label);
                  }
                }}>
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