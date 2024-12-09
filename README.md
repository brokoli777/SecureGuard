# SecureGuard

A Real-Time Image Recognition and Security System

## Features

- **Live Feed Analysis**: Utilizes any webcam to perform real-time object and facial detection.
- **Security Monitoring**: Detects and logs individuals and objects for security and tracking purposes.
- **Member Registration**: Allows uploading member images for recognition, enabling the system to identify registered individuals and highlight unrecognized individuals.
- **Easy Sign-Up**: Quickly sign up using your email or Google account for access. 

## Access Credentials for Test Account

To access the application without creating an account, use the following test credentials:

Username: 

Password: 

Access the application here: https://secure-guard-three.vercel.app

## Setup

Install Libraries

```
npm install
```

Setup the environment variables for Supabase in .env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the application locally

```
npm run dev
```

The application is also hosted online on vercel at https://secure-guard-three.vercel.app

## Deviations from PRJ566
- **Unified Application**: Instead of separate server and client applications, a Node.js-based full-stack application was created for ease of setup and use. This allows users to access the published website without needing to download or run Python files, as the application uses JavaScript-based equivalents of Python libraries.

- **UI Improvements**: The UI has been enhanced from the PRJ566 design to improve user navigation and experience.

- **Sign-Up**: Added support for quick registration via Google acccount. 

- **Testing Routes**: Additional routes were created for testing without sign in.

## Documentation
- [Software Requirements Specification (SRS) - PDF](SRS_SecureGuard.pdf)
