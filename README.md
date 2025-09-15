# CropIt - Full Stack Application

A containerized image cropping application with logo overlay functionality, built with React frontend and Node.js backend.

## 🚀 Live Demo

- **Frontend**: https://imagecropper-frontend-555783181228.us-central1.run.app
- **Backend API**: https://imagecropper-backend-555783181228.us-central1.run.app

## 📋 Features

### Core Functionality
- Upload and crop PNG images with interactive selection
- Real-time preview of cropped images (5% scaled)
- High-quality image generation and download
- Logo overlay configuration with customizable positioning and scaling
- User authentication and personal configuration management

### Technical Features
- RESTful API following best practices
- Containerized deployment with Docker
- Cloud deployment on Google Cloud Platform
- User authentication with Clerk
- MySQL database for configuration persistence
- Responsive React frontend with modern UI

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Image Processing**: Sharp
- **Database**: MySQL (Cloud SQL)
- **Authentication**: Clerk SDK
- **Containerization**: Docker

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3 with custom components
- **Authentication**: Clerk React
- **HTTP Client**: Fetch API
- **Containerization**: Docker with Nginx

### Infrastructure
- **Cloud Platform**: Google Cloud Platform
- **Container Runtime**: Cloud Run
- **Database**: Cloud SQL (MySQL)
- **CI/CD**: Google Cloud Build

## 🔌 API Endpoints

### Image Processing
- `POST /api/image/preview` - Generate scaled preview (5% of original) with logo configuration
- `POST /api/image/generate` - Generate high-quality cropped image

### Configuration Management
- `POST /api/config` - Create new logo configuration
- `GET /api/config` - List user's configurations
- `GET /api/config/:id` - Get specific configuration
- `PUT /api/config/:id` - Update configuration

All endpoints require user authentication via Clerk JWT tokens.

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MySQL (for local database)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/imagecropper.git
   cd imagecropper
   ```

2. **Environment Configuration**
  The project includes a `.env` file with the necessary Clerk configuration.
      Update the values with your own Clerk keys if needed.

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration Options

### Logo Configuration Parameters
- **scaleDown**: Float value (max 0.25) for logo scaling
- **logoPosition**: String values - 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
- **logoImage**: PNG file upload (multipart form data)
- **description**: Text description for configuration identification

### Image Processing Parameters
- **cropCoords**: Array of [x, y, width, height] coordinates
- **configId**: Optional configuration ID for logo overlay

## 🐳 Docker Deployment

### Local Docker Setup
```bash
# Build and run containers
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Individual Container Build
```bash
# Backend
cd backend
docker build -t imagecropper-backend .

# Frontend
cd frontend
docker build -t imagecropper-frontend .
```

## ☁️ Cloud Deployment (Google Cloud Platform)

The application is deployed on Google Cloud Platform using Cloud Run for containerized services.

### Architecture
- **Frontend**: Cloud Run service serving React SPA
- **Backend**: Cloud Run service hosting Node.js API
- **Database**: Cloud SQL MySQL instance
- **Authentication**: Clerk managed authentication

### Deployment Process

1. **Prerequisites**
   - Google Cloud account with billing enabled
   - gcloud CLI installed and configured
   - Clerk account with production keys

2. **Database Setup**
   ``bash
   # Create Cloud SQL instance
   gcloud sql instances create imagecropper-db \
     --database-version=MYSQL_8_0 \
     --tier=db-f1-micro \
     --region=us-central1

   # Create database
   gcloud sql databases create image_cropper --instance=imagecropper-db

   # Set up database schema
   # First, connect to the database
   gcloud sql connect imagecropper-db --user=root --database=image_cropper

   # Then run the schema file to create tables
   SOURCE schema.sql;
   ```

3. **Backend Deployment**
   ```bash
   cd backend
   gcloud run deploy imagecropper-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="NODE_ENV=production,CLERK_SECRET_KEY=your_key,DB_HOST=db_ip,DB_USER=root,DB_PASSWORD=your_password,DB_NAME=image_cropper"
   ```

4. **Frontend Deployment**
   ```bash
   cd frontend
   gcloud run deploy imagecropper-frontend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="VITE_CLERK_PUBLISHABLE_KEY=your_key,VITE_API_BASE_URL=backend_url/api"
   ```

### Deployment Features
- Automatic scaling based on traffic
- HTTPS termination handled by Cloud Run
- Environment-specific configuration
- Health checks and monitoring
- Container-based isolation

## 🔐 Authentication

User authentication is handled by Clerk, providing:
- Secure JWT token-based authentication
- Social login options (Google)
- User session management
- Protected API routes
- Frontend authentication state management

## 🧪 Testing

### Manual Testing
1. Visit the deployed frontend URL
2. Sign in using Clerk authentication
3. Navigate to "Logo Config" to create configurations
4. Return to "Cropper" to test image processing
5. Upload PNG image and select crop area
6. Test preview and generate functionality

### API Testing
Use Postman or curl to test API endpoints with valid JWT tokens:

```bash
# Test configuration creation
curl -X POST https://your-backend-url/api/config \
  -H "Authorization: Bearer your_jwt_token" \
  -F "logoImage=@logo.png" \
  -F "scaleDown=0.1" \
  -F "logoPosition=bottom-right" \
  -F "description=Test Config"
```

## 📊 Database Schema

### configurations table
```sql
CREATE TABLE `configurations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `scale_down` decimal(4,3) DEFAULT NULL,
  `logo_position` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'top-left',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_data` longblob,
  `logo_mime_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_configurations_user_id` (`user_id`),
  CONSTRAINT `configurations_chk_1` CHECK (((`scale_down` <= 0.250) and (`scale_down` > 0))),
  CONSTRAINT `configurations_chk_2` CHECK ((`logo_position` in (_utf8mb4'top-left',_utf8mb4'top-right',_utf8mb4'bottom-left',_utf8mb4'bottom-right',_utf8mb4'center')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🏗 Architecture Decisions

### Backend Architecture
- **MVC Pattern**: Separation of concerns with controllers, models, and routes
- **Middleware Pipeline**: Authentication, file upload, and error handling
- **Database Abstraction**: Custom model layer for database operations
- **Stateless Design**: JWT-based authentication for scalability

### Frontend Architecture
- **Component-Based**: Reusable React components with clear responsibilities
- **State Management**: Built-in React hooks for local state, Clerk for auth state
- **API Layer**: Centralized HTTP client with error handling
- **Responsive Design**: Clean, modern interface with CSS styling

### Deployment Architecture
- **Microservices**: Separate containers for frontend and backend
- **Cloud-Native**: Leveraging managed services (Cloud Run, Cloud SQL)
- **Environment Separation**: Configuration via environment variables
- **Authentication**: Clerk-powered user authentication

## 🔍 Security Considerations

- JWT token validation on all protected endpoints
- User-scoped data access (users can only see their own configurations)
- File upload validation (PNG files only)
- SQL injection prevention through parameterized queries
- HTTPS enforcement in production
- Environment variable protection for sensitive data

## 📈 Performance Optimizations

- Image processing with Sharp for optimal performance
- Connection pooling for database operations
- Container resource optimization
- Vite for fast frontend builds
- CDN delivery through Cloud Run


## 📄 License

This project is developed as part of a technical assessment for Kodecta.

