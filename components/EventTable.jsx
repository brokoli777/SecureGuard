import { Table, TableHead, TableRow, TableBody, TableCell, TableHeader } from "@/components/ui/table";

// Updated EventTable to use correct event data fields
export default function EventTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Team ID</TableHead>
          <TableHead>Object Confidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((event) => (
          <TableRow key={event.event_id}>
            <TableCell>{event.event_id}</TableCell>
            <TableCell>{event.category}</TableCell>
            <TableCell>{new Date(event.date_time).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(event.date_time).toLocaleTimeString()}</TableCell>
            <TableCell>{event.team_id}</TableCell>
            <TableCell>{event.object_confidence}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Helper function to style alert levels (if applicable in future)
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
