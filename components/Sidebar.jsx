import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-600 border border-gray-300 p-4">
      <h1 className="text-2xl font-bold text-white mb-8">SecureGuard</h1>
      <ul>
        <li className="mb-2">
          <Button className="w-full text-left bg-green-900 text-white" variant="outline">
            Event Logs
          </Button>
        </li>
        <li>
          <Button className="w-full text-left bg-green-900 text-white" variant="outline">
            Members
          </Button>
        </li>
      </ul>
    </div>
  );
}
