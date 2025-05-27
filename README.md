# Property Listing Backend

A backend system for managing property listings with advanced filtering, authentication, favorites, and recommendations.

## Tech Stack
- Node.js / TypeScript
- Express
- MongoDB (Mongoose)
- Redis (Cloud)
- JWT Auth

## Setup

1. **Clone the repo**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy `.env.example` to `.env` and fill in your values.
4. **Run locally**
   ```bash
   npm run dev
   ```
5. **Build for production**
   ```bash
   npm run build && npm start
   ```
6. **Import CSV**
   - The CSV will be imported automatically on first server start if the DB is empty.
   - Or run manually:
     ```bash
     npm run import-csv
     ```

## Deployment
- Ready for Render.com or similar Node.js hosting.
- Use a cloud MongoDB (e.g., MongoDB Atlas) and cloud Redis (e.g., Redis Cloud).

## Features
- User registration/login (JWT)
- CRUD for properties (only creator can update/delete)
- Advanced filtering/search
- Favorites (CRUD)
- Recommendations (send property to another user)
- Redis caching

## Environment Variables
See `.env.example` for required variables. 