"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client"; // Ensure this is the client-side client

const supabase = createClient();

interface Member {
  member_id: number; // Change this to use the correct column from your table
  first_name: string;
  last_name: string;
  email: string;
}

export default function MemberList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router for navigation

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null); // Reset error state
      const { data, error } = await supabase.from("members").select("*");

      if (error) {
        console.error("Error fetching members:", error);
        setError("Failed to fetch members.");
      } else {
        setMembers(data as Member[]);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  // Handle search filter
  useEffect(() => {
    setFilteredMembers(
      members.filter((member) =>
        `${member.first_name} ${member.last_name} ${member.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, members]);

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handleEditClick = (member_id: number) => {
    router.push(`/editMember/${member_id}`); // Navigate to the editMember page with the member_id
  };

  const handleCreateMemberClick = () => {
    router.push("/newMember"); // Redirect to the new member creation page
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Members</h1>

      {/* Search Bar */}
      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />
        <Button variant="default" onClick={handleCreateMemberClick}>
          Create New Member
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading members...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member) => (
                <TableRow key={member.member_id}>
                  <TableCell>{member.first_name}</TableCell>
                  <TableCell>{member.last_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(member.member_id)} // Pass member_id for the edit page
                    >
                      ✏️
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        <div className="flex space-x-2 mx-4">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
