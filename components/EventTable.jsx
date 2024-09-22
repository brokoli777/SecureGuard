export default function EventTable({ data }) {
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
        {data.map((event) => (
          <tr key={event.id}>
            <td className="border border-gray-300 p-2">{event.id}</td>
            <td className="border border-gray-300 p-2">{event.type}</td>
            <td className="border border-gray-300 p-2">{event.date}</td>
            <td className="border border-gray-300 p-2">{event.time}</td>
            <td className="border border-gray-300 p-2">{event.name}</td>
            <td className={`border border-gray-300 p-2 ${getAlertStyle(event.alert)}`}>
              {event.alert}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Helper function to style alert levels
function getAlertStyle(alert) {
  switch (alert) {
    case 'Low':
      return 'text-green-500';
    case 'Medium':
      return 'text-yellow-500';
    case 'High':
      return 'text-orange-500';
    case 'Critical':
      return 'text-red-500';
    default:
      return '';
  }
}
