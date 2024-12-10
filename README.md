# SecureGuard

A Real-Time Image Recognition and Security System

## Features

- **Live Feed Analysis**: Utilizes any webcam to perform real-time object and facial detection.
- **Security Monitoring**: Detects and logs individuals and objects for security and tracking purposes.
- **Member Registration**: Allows uploading member images for recognition, enabling the system to identify registered individuals and highlight unrecognized individuals.
- **Easy Sign-Up**: Quickly sign up using your email or Google account for access. 

## Access Credentials for Test Account

To access the application without creating an account, use the following test credentials:

**Username:** `bregwinpaul@gmail.com`

**Password:** `testing123`

Access the application [here](https://secure-guard-three.vercel.app).

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
  
- **Email Limits**: Because of free tier limitations, verification emails are limited to 2 per hour.

## Documentation
- [Software Requirements Specification (SRS) - PDF](SRS_SecureGuard.pdf)

- https://seneca.sharepoint.com/sites/2024-09-03PRJ666NBB-Team04/_layouts/15/stream.aspx?id=%2Fsites%2F2024%2D09%2D03PRJ666NBB%2DTeam04%2FShared%20Documents%2FTeam%2004%2FSECUREGUARD%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ef2027c58%2D73b6%2D4986%2Da526%2D0ad04d2189ae&ga=1
