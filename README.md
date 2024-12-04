# SecureGuard

An Image Recognition Security System

## Features

- Can detect people and objects for security logs.
- Can register members to be recognized and inform when unknown people are detected..

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

### Deviations from PRJ566
- Instead of creating two separate server and client applications which would be difficult for the user to setup, we opted to create a node.js based full stack application that can be accessed from the web or run locally. This means user can use the the published website without downloading any python files as we are using javascript version of python libraries in the application.
