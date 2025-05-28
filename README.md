# Property Listing Backend

A robust backend system for managing property listings with advanced features including authentication, caching, recommendations, and favorites.

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - User registration and login
  - Secure password hashing

- **Property Management**
  - CRUD operations for properties
  - Advanced search and filtering
  - Property recommendations
  - Favorites system
  - Bulk import via CSV

- **Performance Optimization**
  - Redis caching for property listings
  - Efficient MongoDB queries
  - Pagination support

- **Advanced Search**
  - Multiple filter criteria
  - Range-based filtering
  - Text search
  - Sorting options

## 🛠 Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis
- **Authentication**: JWT
- **Data Import**: CSV Parser

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Redis Cloud account
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd property-listing-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     REDIS_URL=your_redis_connection_string
     JWT_SECRET=your_jwt_secret
     CSV_URL=your_csv_data_url
     ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - List properties with filters
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Favorites
- `GET /api/favorites` - List user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Recommendations
- `POST /api/recommendations` - Recommend property
- `GET /api/recommendations/search` - Search users

## 🔍 Advanced Search Parameters

- **Text Search**
  - `title`
  - `type`
  - `state`
  - `city`
  - `amenities`
  - `tags`

- **Numeric Ranges**
  - `minPrice`/`maxPrice`
  - `minAreaSqFt`/`maxAreaSqFt`
  - `bedrooms`
  - `bathrooms`
  - `minRating`/`maxRating`

- **Boolean Filters**
  - `furnished`
  - `isVerified`

- **Pagination & Sorting**
  - `page`
  - `limit`
  - `sortBy`
  - `sortOrder`

## 💾 Data Import

The system supports bulk data import via CSV:
```bash
npm run import-csv
```

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Environment variable protection
- Input validation
- Error handling middleware

## 🚀 Performance Features

- Redis caching for:
  - Property listings
  - Individual properties
- Automatic cache invalidation
- Efficient MongoDB queries
- Pagination support

## 📦 Project Structure

```
src/
├── controllers/     # Business logic
├── models/         # Database schemas
├── routes/         # API endpoints
├── services/       # External services
├── middlewares/    # Custom middlewares
└── utils/          # Helper functions
```

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📝 Environment Variables

Create a `.env` file with:
```
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
CSV_URL=your_csv_url
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- MongoDB Atlas
- Redis Cloud
- Express.js
- TypeScript
