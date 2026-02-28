# Deployment Guide

This guide will help you deploy the BMS College Club Directory application to production.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- Hosting platform account (Vercel, Heroku, AWS, etc.)

## Pre-Deployment Checklist

### 1. Environment Variables

Create environment variables on your hosting platform with the following:

**Backend Server (.env or environment variables):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=college_club_directory
CLIENT_ORIGIN=https://yourdomain.com
SERVER_PORT=4000
API_SERVER_URL=https://api.yourdomain.com
NODE_ENV=production
```

**Frontend (Next.js environment variables):**
```
NEXT_PUBLIC_API_BASE_URL=/api
API_SERVER_URL=https://api.yourdomain.com
```

### 2. Security Checklist

- ✅ All sensitive data is in environment variables (not hardcoded)
- ✅ Database credentials are secure
- ✅ CORS is properly configured for production domain
- ✅ Password hashing is enabled (bcrypt)
- ✅ Email domain validation is in place
- ✅ Password requirements are enforced

### 3. Database Setup

1. **MongoDB Atlas:**
   - Create a cluster on MongoDB Atlas
   - Whitelist your server IP addresses (or use 0.0.0.0/0 for all)
   - Create a database user with read/write permissions
   - Get your connection string

2. **Database Collections:**
   The following collections will be created automatically:
   - `clubs` - Club information
   - `users` - User accounts
   - `events` - Club events
   - `memberships` - User-club memberships
   - `reviews` - Club reviews
   - `announcements` - Club announcements
   - `rsvps` - Event RSVPs
   - `messages` - User messages

### 4. Build Configuration

The project is configured for production builds:
- ESLint errors are ignored during builds (can be enabled later)
- TypeScript errors are ignored during builds (can be enabled later)
- Images are unoptimized (can be optimized with Next.js Image Optimization)

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Frontend Deployment:**
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Backend Deployment:**
- Deploy backend separately to:
  - Railway
  - Render
  - Heroku
  - AWS EC2
  - DigitalOcean

### Option 2: Full Stack on Railway/Render

1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm run start:full`
5. Deploy

### Option 3: Manual Deployment (VPS)

1. **Server Setup:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Clone and Setup:**
   ```bash
   git clone <your-repo-url>
   cd CollegeClubDirectory
   npm install
   ```

3. **Create Environment File:**
   ```bash
   cp env.sample database.env
   # Edit database.env with your production values
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   # Start both frontend and backend
   pm2 start npm --name "club-directory" -- run start:full
   
   # Or start separately
   pm2 start npm --name "backend" -- run server
   pm2 start npm --name "frontend" -- run start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx (Reverse Proxy):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment

### 1. Verify Deployment

- ✅ Frontend loads correctly
- ✅ Backend API responds (check `/health` endpoint)
- ✅ Database connection works
- ✅ User registration works
- ✅ Club creation works
- ✅ Admin approval workflow works

### 2. Create First Admin User

You'll need to create an admin user manually or through the database:

```javascript
// Using MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@bmsce.ac.in",
  passwordHash: "<bcrypt_hash_of_password>",
  role: "admin",
  usn: "ADMIN001",
  yearOfStudy: "N/A",
  phoneNumber: "0000000000"
})
```

Or use the sign-up page and then update the user role in the database.

### 3. Monitor Logs

- Check application logs regularly
- Monitor database connections
- Watch for errors in production

### 4. Backup Strategy

- Set up regular MongoDB Atlas backups
- Export database periodically
- Keep environment variables backed up securely

## Environment-Specific Notes

### Development
- Uses `database.env` file
- Server runs on port 4000
- Frontend runs on port 3000
- CORS allows localhost:3000

### Production
- Uses environment variables from hosting platform
- Server should run on port specified by hosting (or 4000)
- Frontend runs on port 3000 (or hosting default)
- CORS should allow production domain only

## Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

### CORS Errors
- Verify CLIENT_ORIGIN includes your production domain
- Check backend CORS configuration

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for missing environment variables

## Security Recommendations

1. **Change Default Passwords:** Update MongoDB password
2. **Enable HTTPS:** Use SSL certificates for production
3. **Rate Limiting:** Consider adding rate limiting to API endpoints
4. **Input Validation:** All user inputs are validated
5. **Error Handling:** Don't expose sensitive error messages in production
6. **Regular Updates:** Keep dependencies updated

## Support

For deployment issues, contact:
- Technical Support: support@bmsce.ac.in
- Page Administrator: admin@bmsce.ac.in

