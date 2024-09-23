"use client";

import { useState, useEffect } from "react";
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

const membersData = [
  { firstName: "John", lastName: "Doe", email: "john@example.com" },
  { firstName: "Tom", lastName: "Smith", email: "tom@example.com" },
  { firstName: "Jon", lastName: "Brown", email: "jon@example.com" },
  { firstName: "Tomm", lastName: "Lee", email: "tomm@example.com" },
  { firstName: "Ed", lastName: "White", email: "ed@example.com" },
  { firstName: "Fred", lastName: "Black", email: "fred@example.com" },
  { firstName: "Person1", lastName: "Last Name", email: "person1@example.com" },
  // ... Add more mock data or fetch real data from your backend
];

export default function MemberList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10); // Items per page
  const [filteredMembers, setFilteredMembers] = useState(membersData);

  // Handle search filter
  useEffect(() => {
    setFilteredMembers(
      membersData.filter((member) =>
        `${member.firstName} ${member.lastName} ${member.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Members</h1>

      {/* Search Bar - aligned at the top left */}
      <div className="flex justify-start mb-4">
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />
      </div>

      {/* Table */}
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
          {currentMembers.map((member, index) => (
            <TableRow key={index}>
              <TableCell>{member.firstName}</TableCell>
              <TableCell>{member.lastName}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  ✏️
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination - aligned at the bottom right */}
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
