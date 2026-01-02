# 🚀 Full-Stack CMS Website

A modern, feature-rich Content Management System built with **React**, **TypeScript**, **Node.js/Express**, and **MongoDB**. This CMS enables users to create, manage, and publish web pages with a powerful visual page builder, media management, and dynamic site configuration.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9+-blue.svg)
![React](https://img.shields.io/badge/react-19+-61dafb.svg)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Security Features](#-security-features)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Content Management
- 📝 **Visual Page Builder** - Drag-and-drop page creation with block-based layouts
- 📄 **Page Management** - Create, edit, publish, and version control pages
- 🎨 **Custom CSS/HTML Injection** - Add custom styles and scripts to pages
- 📱 **SEO Optimization** - Meta titles, descriptions, and structured data

### Media Management
- 🖼️ **Image Manager** - Upload, organize, and manage media assets
- ☁️ **S3 Integration** - Optional AWS S3 storage for scalable media hosting
- 📁 **Local Storage** - Fallback to local file storage when S3 is not configured

### Site Configuration
- 🔧 **Navigation Settings** - Dynamic navbar configuration with brand logo
- 🦶 **Footer Settings** - Customizable footer with multiple sections and links
- 🔤 **Font Management** - Choose from multiple Google Fonts (Roboto, Open Sans, Rubik, DM Sans)

### User & Authentication
- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin, Editor, and Viewer roles
- 🛡️ **Protected Routes** - Secure admin dashboard access

### Contact Management
- 📧 **Contact Form Submissions** - Collect and manage contact form entries
- ✉️ **Email Notifications** - Optional email notifications via Nodemailer

### Developer Experience
- 📊 **Audit Logging** - Track all admin actions for compliance
- 🔄 **Page Versioning** - Version history for published pages
- 🚦 **Rate Limiting** - Configurable rate limiting to prevent abuse
- 📝 **Comprehensive Logging** - Winston-based logging with multiple transports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript 5.9** | Type Safety |
| **Vite 7** | Build Tool & Dev Server |
| **Tailwind CSS 4** | Styling |
| **React Router 7** | Client-side Routing |
| **Axios** | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20+** | Runtime |
| **Express 5** | Web Framework |
| **TypeScript 5.9** | Type Safety |
| **MongoDB/Mongoose 9** | Database & ODM |
| **Redis** | Caching (Optional) |
| **Zod 4** | Schema Validation |
| **JWT** | Authentication |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **AWS S3** | Media Storage (Optional) |
| **Jest** | Testing |

---

## 📁 Project Structure

```
CMSWebsite/
├── cms-backend/                 # Backend API Server
│   ├── src/
│   │   ├── config/              # Configuration management
│   │   ├── controllers/         # Request handlers
│   │   ├── db/                  # Database connection
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── scripts/             # Utility scripts (seeding, etc.)
│   │   ├── services/            # Business logic layer
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Helper utilities
│   ├── test/                    # Test setup files
│   ├── uploads/                 # Local media storage
│   ├── dockerfile               # Backend Docker image
│   └── docker-compose.yml       # Development stack
│
├── cms-frontend/                # Frontend React Application
│   ├── src/
│   │   ├── api/                 # API client configuration
│   │   ├── auth/                # Authentication components
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   └── types/               # TypeScript types
│   ├── public/                  # Static assets
│   └── scripts/                 # Build scripts
│
├── README.md                    # This file
├── docker-compose.yml           # Production Docker Compose
└── dockerfile                   # Multi-stage production build
```

---

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher (or yarn/pnpm)
- **MongoDB** 6.0+ (local or Atlas)
- **Redis** 7.x (optional, for caching)
- **Docker** & **Docker Compose** (for containerized deployment)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BhaskarKumarSinha/Full-Stack-CMS-Website.git
cd Full-Stack-CMS-Website
```

### 2. Install Backend Dependencies

```bash
cd cms-backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../cms-frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `cms-backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# MongoDB Configuration
MONGODB_URI="YOUR_MONGODB_URI"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API URLs
API_BASE_URL=http://localhost:4000
FILE_BASE_URL=http://localhost:4000

# AWS S3 Configuration (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
RATE_LIMIT_STRICT=20
```

### Frontend Environment Variables

Create a `.env` file in the `cms-frontend` directory:

```env
VITE_API_BASE=http://localhost:4000
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd cms-backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd cms-frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

### Seed Initial Data

```bash
cd cms-backend

# Seed admin user
npm run seed

# Seed component types
npx ts-node-dev --transpile-only src/scripts/seedComponents.ts

# Seed sample pages
npx ts-node-dev --transpile-only src/scripts/seedWebsitePages.ts
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Development mode (with hot reload)
cd cms-backend
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Production Deployment

Use the production Docker Compose file in the root directory:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Stop services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables for Docker

Create a `.env.docker` file for production:

```env
MONGODB_URI=mongodb://mongo:27017/cms
REDIS_URL=redis://redis:6379
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration (Admin only) |

### Page Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pages` | List all pages |
| GET | `/api/admin/pages/:id` | Get page by ID |
| POST | `/api/admin/pages` | Create new page |
| PUT | `/api/admin/pages/:id` | Update page |
| DELETE | `/api/admin/pages/:id` | Delete page |
| POST | `/api/admin/pages/:id/publish` | Publish page |

### Public Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages/resolve?path=/about` | Get published page by path |

### Media Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List all media assets |
| POST | `/api/media/upload` | Upload new media |
| DELETE | `/api/media/:id` | Delete media asset |

### Site Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/site-config` | Get site configuration |
| PUT | `/api/site-config` | Update site configuration |
| GET | `/api/site-config/render-footer` | Get rendered footer HTML |

### Contact Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/admin/contacts` | List contact submissions |
| PUT | `/api/admin/contacts/:id/read` | Mark as read |
| DELETE | `/api/admin/contacts/:id` | Delete submission |

---

## 🗄️ Database Models

### User
```typescript
{
  email: string;        // Unique email address
  passwordHash: string; // Bcrypt hashed password
  role: 'admin' | 'editor' | 'viewer';
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Page
```typescript
{
  slug: string;         // URL-friendly identifier
  path: string;         // Unique page path (e.g., "/about")
  title?: string;
  status: 'draft' | 'published';
  layout: Block[];      // Array of content blocks
  content?: string;     // Full HTML content
  customCss?: string;   // Custom CSS styles
  customHtml?: string;  // Custom HTML injection
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  publishedAt?: Date;
}
```

### MediaAsset
```typescript
{
  fileName: string;
  url: string;          // S3 URL or local path
  mimeType?: string;
  size?: number;
  uploadedBy?: ObjectId;
  createdAt: Date;
}
```

### SiteConfig
```typescript
{
  navConfig: {
    brandName: string;
    logoUrl?: string;
    navItems: any[];
  };
  footerConfig: {
    companyName: string;
    description?: string;
    footerLinks: string[];
    footerSections?: FooterSection[];
  };
  fontFamily?: string;
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - BCrypt with 12 salt rounds
- **Role-Based Access** - Granular permission control

### Rate Limiting
- **General Rate Limiter** - 200 requests per minute
- **Strict Rate Limiter** - 20 requests per minute for sensitive endpoints
- **Slow Down** - Progressive delay after threshold

### Input Validation & Sanitization
- **Zod Validation** - Runtime schema validation
- **Mongo Sanitization** - Prevent NoSQL injection
- **XSS Protection** - HTML escaping and sanitization

### HTTP Security Headers
- **Helmet** - Security headers (CSP, HSTS, X-Frame-Options)
- **CORS** - Configurable cross-origin resource sharing
- **HPP** - HTTP parameter pollution protection

---

## 🧪 Testing

### Run Tests

```bash
cd cms-backend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Test Structure
- Unit tests for services and utilities
- Integration tests for API endpoints
- Test setup with MongoDB memory server

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Document API changes

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Bhaskar Kumar Sinha**

- GitHub: [@BhaskarKumarSinha](https://github.com/BhaskarKumarSinha)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [React](https://react.dev/) - UI library
- [MongoDB](https://www.mongodb.com/) - Document database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
