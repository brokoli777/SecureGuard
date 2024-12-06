"use client";

import React from 'react';

export default function Intro() {
  return (
    <div className="flex flex-col items-center justify-center  text-gray-800 dark:text-gray-200 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">
          Welcome to SecureGuard!
        </h1>
        <img
          className="mx-auto mb-6"
          src="https://cdn-icons-png.flaticon.com/512/9767/9767164.png"
          width={150}
          height={150}
          alt="SecureGuard Logo"
        />
        <p className="text-lg leading-relaxed max-w-xl mx-auto">
          SecureGuard is a security management system that helps you monitor and track using your camera. 
          You can also add and manage members to ensure that only authorized personnel are present.
        </p>
      </div>

      {/* Get Started Section */}
      <div className="mt-12 w-full max-w-3xl">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Get Started</h2>
        <ol className="list-decimal list-inside bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
          <li>
            Navigate to the <b>Vision</b> page using the navigation bar.
          </li>
          <li>
            Click the <b>Start SecureGuard</b> button to activate your webcam and begin tracking events.
          </li>
          <li>
            Visit the <b>Event Logs</b> page to view and filter event logs.
          </li>
        </ol>
      </div>

      {/* Add Members Section */}
      <div className="mt-12 w-full max-w-3xl">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Add Members</h2>
        <ol className="list-decimal list-inside bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
          <li>
            Open the <b>Members</b> page to add and manage team members.
          </li>
          <li>
            Click the <b>Add Member</b> button to input new member details.
          </li>
          <li>
            Fill in the details and click <b>Save</b> to register the member.
          </li>
          <li>
            Once added, SecureGuard will recognize members and notify you if unrecognized individuals are detected.
          </li>
        </ol>
      </div>
    </div>
  );
}
