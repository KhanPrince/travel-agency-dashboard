Travel Agency Dashboard

AI-powered trip planning app. Admins generate complete day-by-day itineraries with Gemini, and anyone can browse the results. Built with React Router 7 (SSR), Appwrite, Gemini and Unsplash.


[Guest Dashboard]<img width="1920" height="1080" alt="guest dashboard" src="https://github.com/user-attachments/assets/9c83d372-d626-4284-9ac8-01c6b3a4c233" />
[Authorized user dashboard]<img width="1920" height="1080" alt="Authorized users Dashboard" src="https://github.com/user-attachments/assets/a0a6d5dd-3e22-407f-a24b-25628d4f46c7" />
[users page]<img width="1920" height="1080" alt="Users page" src="https://github.com/user-attachments/assets/7bbc0360-cbde-4ff6-b682-bd62b202faa0" />

[Ai Trips page]<img width="1920" height="1080" alt="AI trips Page" src="https://github.com/user-attachments/assets/99c222dc-b426-4607-a134-741327b8662a" />



<!-- Add 2-3 screenshots or a GIF here: dashboard, trip detail, create trip --> <!-- ![Dashboard](docs/dashboard.png) -->

Features
Public dashboard: browse every trip with infinite scroll, no account needed.
AI itinerary generation: pick a country, duration, travel style, interests, budget and group type. Gemini returns a structured itinerary (activities per day, best time to visit, weather, price estimate) and Unsplash supplies photos.
Three access levels: guest, signed-in user, admin. Restricted pages show a gate with sign-in or "request admin access" instead of a blank redirect.
Admin requests: users ask for admin access from the app; an admin approves manually.
Trip management: admins view, edit and delete their own trips. Everyone else gets a read-only detail page.
User management: admin-only table of all users (Syncfusion grid).
Google sign-in through Appwrite OAuth.
Error monitoring with Sentry (production only, optional).
Access levels
Role Dashboard and trip details AI Trips, Create Trip, All Users
Guest yes gate with sign-in options
User yes gate with "request admin access"

Admin yes full access

New sign-ups are regular users. Admin access is granted manually.

Tech stack
Frontend / SSR: React 19, React Router 7, Tailwind CSS 4, Syncfusion (grid, combo box, maps, buttons, sidebar)
Backend services: Appwrite (auth, database), Google Gemini (@google/genai), Unsplash API, REST Countries API
Monitoring: Sentry
Deployment: Docker (multi-stage, Node 22 Alpine)
Architecture
Google OAuth, reads(session)
POST /trips/api/create-trip+ JWT
verify JWT, check adminrole, write row
Browser
Appwrite
React Router server
Gemini
Unsplash

How trip creation is protected

The browser creates a short-lived Appwrite JWT and sends it in the Authorization header.
The server builds a fresh Appwrite client from that JWT, loads the user, and checks the admin status. The user ID is never taken from the request body.
Input is validated against allow-lists (country length, 1-10 days, travel style, interests, budget, group type) before anything reaches Gemini.
The trip row is created with read access for everyone and update/delete access for its creator only.

Route guards in the UI are a convenience. Real enforcement is the JWT check on the API and Appwrite table permissions.

Project structure
app/
appwrite/ Appwrite client and auth helpers (roles, admin requests)
components/ Header, TripCard, InfiniteTripGrid, AccessGate, CreatorCta, ...
constants/ Select options, sidebar items, world map data
routes/
root/ home redirect, sign-in, OAuth callback
admin/ layout, dashboard, trips, create/edit/detail, all-users
api/ create-trip (server action), trips (data access)
.server/ server-only helpers (require-admin)
public/assets/ icons and images
Getting started
Prerequisites
Node.js 22+
An Appwrite project (cloud or self-hosted)
API keys: Gemini, Unsplash, REST Countries, a Syncfusion license key (community license is free)

1. Install
   bash
   git clone https://github.com/KhanPrince/travel-agency-dashboard.git
   cd travel-agency-dashboard
   npm ci
   cp .env.example .env.local
2. Configure Appwrite

Create a database with three tables.

users

Column Type
accountId string (unique index)
name, email, imageUrl string
joinedAt datetime
status string (user or admin)

trips

Column Type
name, description, estimatedPrice string
duration integer
budget, travelStyle, country, interests, groupType string
bestTimeToVisit, weatherInfo, imageUrls string array
location, itinerary string (JSON, itinerary needs a large size)
createdAt datetime
userId string (index)

adminRequests

Column Type
userId string

Permissions

Table Table-level permissions
trips Read: Any · Create: Users · row security on
users Create: Users · row security on · Read: restrict to admins (for example the admin label)
adminRequests Create: Users · row security on

Also in the Appwrite console:

Auth → Settings: enable the Google OAuth2 provider.
Overview → Platforms: add a Web platform for localhost and your production domain.
Never put an Appwrite API key in a VITE\_ variable. Nothing in this app needs one. 3. Environment variables

Copy .env.example to .env.local and fill it in.

Variable Where it runs Purpose
VITE_APPWRITE_API_ENDPOINT build + browser Appwrite endpoint
VITE_APPWRITE_PROJECT_ID build + browser Appwrite project
VITE_APPWRITE_DATABASE_ID build + browser Database ID
VITE_APPWRITE_USERS_TABLE_ID build + browser Users table
VITE_APPWRITE_TRIPS_TABLE_ID build + browser Trips table
VITE_APPWRITE_ADMIN_REQUESTS_TABLE_ID build + browser Admin requests table
VITE_SYNCFUSION_LICENSE_KEY build + browser Syncfusion license
GEMINI_API_KEY server only Itinerary generation
UNSPLASH_ACCESS_KEY server only Trip photos
RESTCOUNTRIES_API_KEY server only Country list
SENTRY_AUTH_TOKEN build only Source map upload (optional)
VITE_SENTRY_DSN, SENTRY_DSN browser / server Error reporting (optional)

VITE\_ variables are baked into the bundle at build time and are visible in the browser. Keep every secret without that prefix.

4. Run
   bash
   npm run dev # http://localhost:5173
   npm run typecheck
   npm run build
   npm run start
5. Make yourself an admin

Sign in once with Google. Then, in the Appwrite console, set your row's status to admin in the users table (and add the admin label to your account if you restricted users-table reads to that label).

Docker

The VITE\_\* values are needed at build time, so pass them as build args.

bash
docker build \
 --build-arg VITE_APPWRITE_API_ENDPOINT=... \
 --build-arg VITE_APPWRITE_PROJECT_ID=... \
 --build-arg VITE_APPWRITE_DATABASE_ID=... \
 --build-arg VITE_APPWRITE_USERS_TABLE_ID=... \
 --build-arg VITE_APPWRITE_TRIPS_TABLE_ID=... \
 --build-arg VITE_APPWRITE_ADMIN_REQUESTS_TABLE_ID=... \
 --build-arg VITE_SYNCFUSION_LICENSE_KEY=... \
 -t travel-agency .

docker run -p 3000:3000 \
 -e GEMINI_API_KEY=... \
 -e UNSPLASH_ACCESS_KEY=... \
 -e RESTCOUNTRIES_API_KEY=... \
 travel-agency
Deployment checklist
Add the production domain as a Web platform in Appwrite.
Add the production redirect URLs to your Google OAuth client.
Set the server-only variables on the host. Never commit .env\* files.
Open the site in a private window and confirm the dashboard loads for guests.
Confirm POST /trips/api/create-trip returns 401 without a token.
Performance notes
List queries select only the fields a card needs, so large itinerary JSON is not downloaded.
Infinite scroll uses an IntersectionObserver with a "Load more" fallback.
Syncfusion stylesheets are imported per route instead of globally.
Sentry Replay and feedback widgets are not bundled.
Roadmap
Rate limiting and a daily cap on generations
Unit tests for input validation and CI on every push
Cursor-based pagination
Server-rendered public pages for faster first paint and link previews
License

MIT. See LICENSE.

<!-- Credits: if the project started from a tutorial or template, name it here and list what you built yourself (roles and admin requests, JWT-protected API, schema design, infinite scroll, validation). -->
