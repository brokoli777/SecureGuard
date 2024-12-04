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
          membersMap[member.member_id] = `${member.first_name} ${member.last_name}`;
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
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterEvents(searchTerm, filterDate, category);
  };

  // Filter events
  const filterEvents = (searchTerm, filterDate, selectedCategory) => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.team_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (membersMap[event.member_id] &&
            membersMap[event.member_id].toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date_time).toISOString().split("T")[0];
        return eventDate === filterDate;
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (event) => event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
  };

  // Reset filters and data
  const resetFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setSelectedCategory("");
    setFilteredEvents(events); // Reset to original data
  };

  const eventsWithMemberNames = filteredEvents.map((event) => ({
    ...event,
    member_name: event.member_id ? membersMap[event.member_id] : "N/A",
  }));

  const getRowClassName = (event) => {
    if (
      event.category === "person" &&
      (!event.member_id || membersMap[event.member_id] === "N/A")
    ) {
      return "bg-amber-600 text-white";
    }
    return "";
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
          <PrintButtons filteredEvents={eventsWithMemberNames} />
        </div>

        <div className="mb-6">
          <EventLogDashboard
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
            onCategoryFilter={handleCategoryFilter}
            resetFilters={resetFilters}
          />
        </div>

        {eventsWithMemberNames.length === 0 ? (
          <p>No events found for the current filter.</p>
        ) : (
          <EventTable
            data={eventsWithMemberNames}
            hideMemberColumn={false}
            filterDate={filterDate}
            selectedMemberName={searchTerm}
            membersMap={membersMap}
            getRowClassName={getRowClassName}
          />
        )}
      </div>
    </div>
  );
}
