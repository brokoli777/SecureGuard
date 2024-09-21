export default function EventTable() {
    return (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Time</th>
            <th className="border border-gray-300 p-2">Name/Unrecognized</th>
            <th className="border border-gray-300 p-2">Alert</th>
          </tr>
        </thead>
        <tbody>
          {/* Dynamic rows will go here */}
        </tbody>
      </table>
    );
  }
  