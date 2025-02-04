import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ITEMS_PER_PAGE = 15; // Number of items per page

export default function EventTable({
  data,
  hideMemberColumn,
  filterDate,
  selectedMemberName,
  membersMap,
  getRowClassName,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Function to filter events
  const filterEvents = () => {
    let filtered = data;

    // Apply the member filtering if needed
    if (selectedMemberName === "N/A" || selectedMemberName === null) {
      filtered = filtered.filter(
        (event) =>
          event.category === "person" &&
          (!event.member_id ||
            membersMap[event.member_id] === "N/A" ||
            membersMap[event.member_id] === null)
      );
    }

    if (filterDate) {
      const filterDateObj = new Date(filterDate);
    }

    return filtered;
  };

  const filteredData = filterEvents(); // Apply filtering logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Calculate the index range for the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="w-full p-6">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Category</TableHead>
              {!hideMemberColumn && <TableHead>Member</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Team ID</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((event) => (
              <TableRow key={event.event_id} className={getRowClassName(event)}>
                <TableCell>{event.event_id}</TableCell>
                <TableCell>{event.category}</TableCell>
                {!hideMemberColumn && (
                  <TableCell>{event.member_name}</TableCell>
                )}
                <TableCell>
                  {new Date(event.date_time).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(event.date_time).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {event.team_id
                    ? `${event.team_id.substring(0, 4)}...${event.team_id.slice(-4)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {Number(event.object_confidence).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        {/* <div className="flex gap-4 items-center justify-center mt-4 py-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}>
            Next
          </Button>
        </div> */}
      </div>
    </Card>
  );
}
