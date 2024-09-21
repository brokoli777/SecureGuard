import EventTable from './EventTable';

export default function EventLogDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Event Logs </h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Name"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center mb-4 space-x-4">
        <label htmlFor="filter-date" className="text-lg">
          Filter By:
        </label>
        <input
          type="date"
          id="filter-date"
          className="p-2 border border-gray-300 rounded"
        />
        <div className="flex space-x-2">
          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Unrecognized
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Recognized Person
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Weapon
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Fire
          </button>
        </div>
      </div>

      <EventTable />
    </div>
  );
}
