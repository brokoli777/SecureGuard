export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-600 border border-gray-300 p-4">
      <h1 className="text-2xl font-bold mb-8">SecureGuard</h1>
      <ul>
        <li>
          <button className="block w-full text-left py-2 px-4 bg-green-900 text-white rounded mb-2">
            Event Logs
          </button>
        </li>
        <li>
          <button className="block w-full text-left py-2 px-4 bg-green-900 text-white rounded">
            Members
          </button>
        </li>
      </ul>
    </div>
  );
}
