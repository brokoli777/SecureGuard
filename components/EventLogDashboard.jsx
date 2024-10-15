import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EventLogDashboard({ onSearch, onDateFilter, onCategoryFilter }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Event Logs</h2>


      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search By Category"
          className="w-full mb-4"
          onChange={(e) => onSearch(e.target.value)} // Trigger search on input change
        />
      </div>

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
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="bg-blue-900 text-white w-32"
            onClick={() => onCategoryFilter('person')} // Filter by "Person" category
          >
            Person
          </Button>
          <Button
            variant="outline"
            className="bg-blue-900 text-white w-32"
            onClick={() => onCategoryFilter('Fire')} // Filter by "Fire" category
          >
            Fire
          </Button>
          <Button
            variant="outline"
            className="bg-blue-900 text-white w-32"
            onClick={() => onCategoryFilter('Weapon')} // Filter by "Weapon" category
          >
            Weapon
          </Button>
          <Button
            variant="outline"
            className="bg-blue-900 text-white w-32"
            onClick={() => onCategoryFilter('Unrecognized')} // Filter by "Unrecognized" category
          >
            Unrecognized
          </Button>
        </div>
      </div>
    </div>
  );
}
