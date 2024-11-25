import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EventLogDashboard({
  onSearch,
  onDateFilter,
  onCategoryFilter,
}) {
  return (
    <div className="mb-4">
      {/* Search input */}
      <Input
        type="text"
        placeholder="Search By Category"
        className="w-full mb-4"
        onChange={(e) => onSearch(e.target.value)} // Trigger search on input change
      />

      {/* Filters */}
      <div className="flex items-center mb-4 space-x-4">
        <label htmlFor="filter-date" className="text-lg">
          Date:
        </label>
        <Input
          type="date"
          id="filter-date"
          className="p-2 border border-gray-300 rounded"
          onChange={(e) => onDateFilter(e.target.value)} // Trigger date filter on input change
        />

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {["Person", "Fire", "Weapon", "Unrecognized"].map((category) => (
            <Button
              key={category}
              className="bg-[#1e40af] hover:bg-[#1e3a8a]  text-white w-[140px]"
              onClick={() => onCategoryFilter(category.toLowerCase())}>
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
