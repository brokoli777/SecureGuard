"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  photo_url: string | null;
}

export default function MemberList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleMemberClick = (member_id: number) => {
    router.push(`/memberAccount/${member_id}`); // Navigate to the member account page
  };

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
              <TableHead>Photo</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member) => (
                <TableRow
                  key={member.member_id}
                  onClick={() => handleMemberClick(member.member_id)} // Navigate to member's account page on row click
                  className="cursor-pointer">
                  <TableCell>
                    {member.photo_url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-lg">
                          {member.first_name.charAt(0)}
                          {member.last_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{member.first_name}</TableCell>
                  <TableCell>{member.last_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering row click event
                        handleEditClick(member.member_id);
                      }}>
                      ✏️
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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
          disabled={currentPage === 1}>
          Previous
        </Button>
        <div className="flex space-x-2 mx-4">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              className="pointer-events-none"
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
