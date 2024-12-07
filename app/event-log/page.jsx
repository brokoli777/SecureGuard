"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import EventTable from "@/components/EventTable";
import EventLogDashboard from "@/components/EventLogDashboard";
import PrintButtons from "@/components/PrintAndExportButtons";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export default function TestEventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [membersMap, setMembersMap] = useState({}); // Store member_id -> name map

  const [currentPage, setCurrentPage] = useState(1); // Add currentPage state
  const itemsPerPage = 10; // Set the number of items per page

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("team_id", user.id)
          .order("date_time", { ascending: false });

        if (eventsError) {
          setError(eventsError.message);
          return;
        }

        const { data: membersData, error: membersError } = await supabase
          .from("members")
          .select("member_id, first_name, last_name");

        if (membersError) {
          setError("Error fetching members data");
          return;
        }

        const membersMap = {};
        membersData.forEach((member) => {
          membersMap[member.member_id] =
            `${member.first_name} ${member.last_name}`;
        });

        setMembersMap(membersMap);
        setEvents(events);
        setFilteredEvents(events); // Initialize filtered events
      } catch (err) {
        setError("Failed to fetch events or members data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search input
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    filterEvents(searchValue, filterDate, selectedCategory);
  };

  // Handle date filter
  const handleDateFilter = (dateValue) => {
    setFilterDate(dateValue);
    filterEvents(searchTerm, dateValue, selectedCategory);
  };

  // Handle category filter
  const handleCategoryFilter = (category, memberName) => {
    setSelectedCategory(category);
    filterEvents(searchTerm, filterDate, category, memberName);
  };

  // Function to filter events based on the search term, date, category, and member name
  const filterEvents = (
    searchTerm,
    filterDate,
    selectedCategory,
    selectedMemberName
  ) => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.team_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (membersMap[event.member_id] &&
            membersMap[event.member_id]
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date_time);
        // Compare only the date parts (YYYY-MM-DD)
        const eventDateString = eventDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const filterDateString = filterDateObj.toISOString().split("T")[0]; // YYYY-MM-DD
        return eventDateString === filterDateString;
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (event) =>
          event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by member name if it's "N/A" (for Unrecognized filter) or null member_id
    if (selectedMemberName === "N/A" || selectedMemberName === null) {
      filtered = filtered.filter(
        (event) => !event.member_id || membersMap[event.member_id] === "N/A"
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset pagination when the filter changes
  };

  // Reset filters and data
  const resetFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setSelectedCategory("");
    setFilteredEvents(events); // Reset to original data
    setCurrentPage(1); // Reset pagination on reset
  };

  // Map events to include member names, setting "Unrecognized" where appropriate
  const eventsWithMemberNames = filteredEvents.map((event) => {
    let memberName = "";
    const category = event.category?.toLowerCase() || "";

    if (event.member_id && membersMap[event.member_id]) {
      memberName = membersMap[event.member_id];
    } else if (category === "person") {
      memberName = "Unrecognized";
    } else {
      memberName = "N/A";
    }

    return { ...event, member_name: memberName };
  });

  // Adjust the getRowClassName function to highlight hazardous events
  const getRowClassName = (event) => {
    const category = event.category?.toLowerCase() || "";
    if (category === "person" && event.member_name === "Unrecognized") {
      return "bg-amber-600 text-white"; // Highlight for unrecognized persons
    } else if (category === "gun") {
      return "bg-red-600 text-white"; // Highlight for gun events
    } else if (category === "fire") {
      return "bg-orange-600 text-white"; // Highlight for fire events
    }
    return "";
  };

  // Paginate filtered events
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = eventsWithMemberNames.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Event Logs</h1>
          <PrintButtons
            currentPageEvents={currentEvents}
            allFilteredEvents={eventsWithMemberNames}
          />
        </div>

        <div className="mb-6">
          <EventLogDashboard
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
            onCategoryFilter={handleCategoryFilter}
            resetFilters={resetFilters}
          />
        </div>

        {currentEvents.length === 0 ? (
          <p>No events found for the current filter.</p>
        ) : (
          <EventTable
            data={currentEvents}
            hideMemberColumn={false}
            filterDate={filterDate}
            selectedMemberName={searchTerm}
            membersMap={membersMap}
            getRowClassName={getRowClassName}
          />
        )}

        {/* Pagination Controls */}
        <div className="flex gap-4 items-center justify-center mt-4 py-4 border-t">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </Button>
          <span className="text-sm">Page {currentPage}</span>
          <Button
            variant="outline"
            disabled={currentPage * itemsPerPage >= filteredEvents.length}
            onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
