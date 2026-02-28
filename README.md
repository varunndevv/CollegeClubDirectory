# BMS College Club Directory

A comprehensive platform for students to discover, explore, and join various clubs and organizations at BMS College of Engineering.

## Features

- 🎯 **Club Discovery**: Browse clubs by category, view details, and read reviews
- 👥 **User Management**: Secure authentication with email domain validation (@bmsce.ac.in)
- 📝 **Club Management**: Create clubs with admin approval workflow
- 📅 **Event Management**: View and RSVP to club events
- ⭐ **Reviews & Ratings**: Rate and review clubs
- 💬 **Messaging**: Direct messaging between users
- 🔐 **Admin Dashboard**: Approve/reject club requests and manage the platform

## Tech Stack

- **Frontend**: Next.js 16, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CollegeClubDirectory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.sample database.env
# Edit database.env with your MongoDB connection string
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Project Structure

```
CollegeClubDirectory/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── admin/             # Admin dashboard
│   ├── clubs/             # Club listing and detail pages
│   ├── contact/           # Contact page
│   ├── create-club/       # Club creation page
│   ├── sign-in/           # Sign in page
│   └── sign-up/           # Sign up page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Other components
├── lib/                  # Utility functions
├── server/               # Backend server
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── seed/            # Database seeding
│   └── utils/           # Server utilities
└── public/              # Static assets
```

## Key Features Explained

### Email Domain Validation
Only users with `@bmsce.ac.in` email addresses can register and sign in.

### Password Requirements
Passwords must contain:
- At least one uppercase letter
- At least one special character
- At least one number
- Minimum 6 characters

### Club Approval Workflow
1. User creates a club request
2. Club is created with `status: "pending"`
3. Admin reviews the request in the admin dashboard
4. Admin approves or rejects the club
5. If approved, the creator is automatically promoted to club admin

### Admin Dashboard
Accessible at `/admin/dashboard` for users with admin role. Features:
- View all pending club requests
- Approve or reject clubs
- Automatic user promotion on approval

## Environment Variables

See `env.sample` for required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name
- `CLIENT_ORIGIN`: Frontend URL for CORS
- `SERVER_PORT`: Backend server port
- `API_SERVER_URL`: Backend API URL
- `NEXT_PUBLIC_API_BASE_URL`: Frontend API base URL

## Database

The application uses MongoDB with the following collections:
- `clubs`: Club information
- `users`: User accounts
- `events`: Club events
- `memberships`: User-club memberships
- `reviews`: Club reviews and ratings
- `announcements`: Club announcements
- `rsvps`: Event RSVPs
- `messages`: User messages

See `DATABASE_VIEWING_GUIDE.md` for instructions on viewing database contents.

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

Quick deployment steps:
1. Set up environment variables on your hosting platform
2. Build the application: `npm run build`
3. Start the application: `npm run start:full`

## Scripts

- `npm run dev`: Start development server (frontend + backend)
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run server`: Start backend server only
- `npm run lint`: Run ESLint

## Security

- ✅ Password hashing with bcrypt
- ✅ Email domain validation
- ✅ Input validation on frontend and backend
- ✅ CORS configuration
- ✅ Environment variables for sensitive data
- ✅ No hardcoded credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Technical Support: support@bmsce.ac.in
- Page Administrator: admin@bmsce.ac.in
- General Inquiries: clubdirectory@bmsce.ac.in

## License

© 2025 BMS College of Engineering. All rights reserved.

