"use client";

import React from 'react'

export default function intro() {
  return (
    <div className='text-center'>
        {/* Say what secureguard is about */}

        <div className='text-2xl font-extrabold'>Thank you for registering with SecureGuard!</div> <br/>

        <img className='mx-auto' src='https://cdn-icons-png.flaticon.com/512/9767/9767164.png' width={200} height={200} alt='SecureGuard Logo' />
        <p>
            <br/><br/>
            SecureGuard is a security management system that helps you track people and objects from your camera. <br/>
            It also allows you to add and manage members to ensure that only authorized personnel are present. <br/><br/>
            
        </p>

        <div className='text-lg font-bold'>Get Started</div><br />

        <ol className="list-decimal">
            <li>Go to the <b>Vision</b> page (can be found in the navigation bar) <br/></li>
            <li>Click the <b>Start SecureGuard</b> to open your webcam and start tracking event logs. <br/></li>
            <li>Go to the <b>Event Logs</b> page to view and filter event logs that were created.<br/></li>
        </ol>

        <br />

        <div className='text-lg font-bold'>Add Members</div><br />

        <ol className="list-decimal">
            <li>Go to the <b>Members</b> page to add and manage members. <br/></li>
            <li>Click the <b>Add Member</b> button to add a new member. <br/></li>
            <li>Fill in the member's details and click <b>Save</b> to add the member. <br/></li>
            <li>Now, when you run Secureguard, the app will be able to detect the members <br/> as well as inform if a person is unrecognized</li>
        </ol>
    </div>
  )
}
