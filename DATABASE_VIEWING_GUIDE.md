# How to View Database Contents

This guide explains how to view the contents of your MongoDB database for the College Club Directory project.

## Method 1: MongoDB Atlas Web Interface (Recommended)

1. **Access MongoDB Atlas:**
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - Log in with your MongoDB Atlas account credentials

2. **Navigate to Your Cluster:**
   - Click on "Clusters" in the left sidebar
   - Select your cluster: `collegeclubdirectory`

3. **Browse Collections:**
   - Click the "Browse Collections" button
   - You'll see all collections in your database:
     - `clubs` - All club information
     - `users` - User accounts and profiles
     - `events` - Club events
     - `memberships` - User-club memberships
     - `reviews` - Club reviews and ratings
     - `announcements` - Club announcements
     - `rsvps` - Event RSVPs
     - `messages` - User messages

4. **View Documents:**
   - Click on any collection to see its documents
   - You can filter, sort, and search documents
   - Click on individual documents to view/edit them

## Method 2: MongoDB Compass (Desktop Application)

1. **Download MongoDB Compass:**
   - Visit [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)
   - Download and install MongoDB Compass

2. **Connect to Your Database:**
   - Open MongoDB Compass
   - Use your connection string: `mongodb+srv://varun_dev:Varun1234@collegeclubdirectory.ngr7t2m.mongodb.net/`
   - Click "Connect"

3. **Browse Collections:**
   - Select the database: `college_club_directory`
   - Browse collections and documents
   - Use the query bar to filter documents

## Method 3: Using Node.js Script

Create a file `view-database.js`:

```javascript
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config({ path: "database.env" })

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "college_club_directory"

async function viewDatabase() {
  try {
    await mongoose.connect(uri, { dbName })
    console.log("Connected to MongoDB\n")

    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()

    console.log("Collections in database:")
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      console.log(`  - ${collection.name}: ${count} documents`)
    }

    console.log("\n--- Sample Documents ---\n")

    // View sample clubs
    const clubs = await db.collection("clubs").find({}).limit(3).toArray()
    console.log("Sample Clubs:")
    console.log(JSON.stringify(clubs, null, 2))

    // View sample users
    const users = await db.collection("users").find({}).limit(3).toArray()
    console.log("\nSample Users:")
    console.log(JSON.stringify(users, null, 2))

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

viewDatabase()
```

Run it with: `node view-database.js`

## Method 4: Using MongoDB Shell (mongosh)

1. **Install MongoDB Shell:**
   - Download from [https://www.mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell)

2. **Connect:**
   ```bash
   mongosh "mongodb+srv://varun_dev:Varun1234@collegeclubdirectory.ngr7t2m.mongodb.net/college_club_directory"
   ```

3. **View Collections:**
   ```javascript
   show collections
   ```

4. **Query Documents:**
   ```javascript
   db.clubs.find().pretty()
   db.users.find().pretty()
   db.events.find().pretty()
   ```

## Database Structure

### Collections Overview:

- **clubs**: Club information (name, description, category, status, etc.)
- **users**: User accounts (name, email, password hash, role, etc.)
- **events**: Club events (title, date, location, clubId, etc.)
- **memberships**: User-club relationships (userId, clubId, status, role)
- **reviews**: Club reviews (clubId, userId, rating, comment)
- **announcements**: Club announcements (clubId, title, content)
- **rsvps**: Event RSVPs (eventId, userId, status)
- **messages**: User messages (senderId, receiverId, content)

## Important Notes

- **Security**: Never share your connection string publicly
- **Backup**: Regularly backup your database
- **Indexes**: The database uses indexes for performance on userId, clubId, etc.
- **Status Field**: Clubs have a `status` field: "pending", "approved", or "rejected"

## Quick Queries

### Find all pending clubs:
```javascript
db.clubs.find({ status: "pending" })
```

### Find all approved clubs:
```javascript
db.clubs.find({ status: "approved" })
```

### Find all users:
```javascript
db.users.find({}, { passwordHash: 0 }) // Exclude password hash
```

### Count documents:
```javascript
db.clubs.countDocuments()
db.users.countDocuments()
```

