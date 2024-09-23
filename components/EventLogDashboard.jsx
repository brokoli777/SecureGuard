import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EventLogDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Event Logs</h2>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search Name"
          className="w-full mb-4"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center mb-4 space-x-4">
        <label htmlFor="filter-date" className="text-lg">
          Filter By:
        </label>
        <Input
          type="date"
          id="filter-date"
          className="p-2 border border-gray-300 rounded"
        />

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-blue-900 text-white w-32">
            Unrecognized
          </Button>
          <Button variant="outline" className="bg-blue-900 text-white w-32">
            Recognized Person
          </Button>
          <Button variant="outline" className="bg-blue-900 text-white w-32">
            Weapon
          </Button>
          <Button variant="outline" className="bg-blue-900 text-white w-32">
            Fire
          </Button>
        </div>
      </div>
    </div>
  );
}
