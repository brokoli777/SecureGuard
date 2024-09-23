import Sidebar from '@/components/Sidebar';
import EventLogDashboard from '@/components/EventLogDashboard';
import EventTable from '@/components/EventTable';

export default function EventLogPage() {
  // Fake data here, will be replaced with call to database
  const eventData = [
    {
      id: 1,
      type: 'Unrecognized Person',
      date: '2024-06-13',
      time: '08:30',
      name: 'Unknown',
      alert: 'Medium',
    },
    {
      id: 2,
      type: 'Recognized Person',
      date: '2024-06-13',
      time: '09:15',
      name: 'John Doe',
      alert: 'Low',
    },
    {
      id: 3,
      type: 'Weapon Detected',
      date: '2024-06-13',
      time: '10:20',
      name: 'Unknown',
      alert: 'High',
    },
    {
      id: 4,
      type: 'Fire Detected',
      date: '2024-06-13',
      time: '11:45',
      name: 'N/A',
      alert: 'Critical',
    },
    {
      id: 5,
      type: 'Unrecognized Person',
      date: '2024-06-13',
      time: '13:00',
      name: 'Unknown',
      alert: 'Medium',
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6">
        <EventLogDashboard />
        {/* Pass the fake data, update to backend call */}
        <EventTable data={eventData} />
      </div>
    </div>
  );
}
