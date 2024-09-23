import { Table, TableHead, TableRow, TableBody, TableCell, TableHeader } from "@/components/ui/table";

export default function EventTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Name/Unrecognized</TableHead>
          <TableHead>Alert</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((event) => (
          <TableRow key={event.id}>
            <TableCell>{event.id}</TableCell>
            <TableCell>{event.type}</TableCell>
            <TableCell>{event.date}</TableCell>
            <TableCell>{event.time}</TableCell>
            <TableCell>{event.name}</TableCell>
            <TableCell className={getAlertStyle(event.alert)}>{event.alert}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
