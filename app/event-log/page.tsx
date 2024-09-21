import Sidebar from '@/components/Sidebar';
import EventLogOverview from '@/components/EventLogDashboard';

export default function EventLogPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-grow p-6">
        <EventLogOverview />
      </div>
    </div>
  );
}
