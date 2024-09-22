

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
          <button className="bg-blue-900 text-white py-1 px-2 rounded text-sm w-32">
            Unrecognized
          </button>
          <button className="bg-blue-900 text-white py-1 px-2 rounded text-sm w-32">
            Recognized Person
          </button>
          <button className="bg-blue-900 text-white py-1 px-2 rounded text-sm w-32">
            Weapon
          </button>
          <button className="bg-blue-900 text-white py-1 px-2 rounded text-sm w-32">
            Fire
          </button>
        </div>
      </div>


    </div>
  );
}
