import { useState } from 'react';
import { Table, TableHead, TableRow, TableBody, TableCell, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 15; // Number of items per page

export default function EventTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index range for the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < Math.ceil(data.length / ITEMS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
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
          {currentData.map((event) => (
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

      {/* Pagination controls */}
      <div className="flex justify-center mt-4 space-x-4">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {Math.ceil(data.length / ITEMS_PER_PAGE)}</span>
        <Button onClick={handleNextPage} disabled={currentPage >= Math.ceil(data.length / ITEMS_PER_PAGE)}>
          Next
        </Button>
      </div>
    </div>
  );
}
