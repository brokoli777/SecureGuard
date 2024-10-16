"use client";

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client"; 
import EventTable from '@/components/EventTable'; 
import EventLogDashboard from '@/components/EventLogDashboard'; 

const supabase = createClient();


export default function TestEventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      // Fetch the logged-in user
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        // Fetch events for the logged-in user (matching team_id with user.id)
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('team_id', user.id);

        if (error) {
          setError(error.message);
        } else {
          setEvents(events);
          setFilteredEvents(events); // Initialize filtered events
        }
      } catch (err) {
        setError('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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

  // Function to filter events based on the search term, date, and category
  const filterEvents = (searchTerm, filterDate, selectedCategory) => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.team_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(event => {
        // Extract event date and format it as YYYY-MM-DD 
        const eventDate = new Date(event.date_time).toISOString().split('T')[0];
        return eventDate === filterDate;
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <EventLogDashboard
        onSearch={handleSearch}
        onDateFilter={handleDateFilter}
        onCategoryFilter={handleCategoryFilter}
      />
      {filteredEvents.length === 0 ? (
        <p>No events found for the current user.</p>
      ) : (
        <EventTable data={filteredEvents} /> // Pass filtered events data to EventTable
      )}
    </div>
  );
}
