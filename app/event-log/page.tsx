import Sidebar from '@/components/Sidebar';
import EventLogDashboard from '@/components/EventLogDashboard';

export default function EventLogPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-grow p-6">
        <EventLogDashboard />
      </div>
    </div>
  );
}
