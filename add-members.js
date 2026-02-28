import mongoose from 'mongoose'
import Membership from './server/models/Membership.js'
import Club from './server/models/Club.js'
import User from './server/models/User.js'
import dotenv from 'dotenv'

dotenv.config()

async function addMemberships() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-clubs')
    console.log('Connected to MongoDB')

    // Get clubs
    const clubs = await Club.find()
    console.log(`Found ${clubs.length} clubs`)

    // Create or get admin user
    let admin = await User.findOne({ email: 'admin@bmsce.ac.in' })
    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'admin@bmsce.ac.in',
        usn: '1BM00AD000',
        role: 'pageAdmin',
        passwordHash: 'Admin@123'
      })
      await admin.save()
      console.log('Created admin user')
    }

    // Add memberships for each club
    for (const club of clubs) {
      const existingMembership = await Membership.findOne({
        userId: admin._id.toString(),
        clubId: club._id.toString()
      })

      if (!existingMembership) {
        const membership = new Membership({
          userId: admin._id.toString(),
          clubId: club._id.toString(),
          userName: admin.name,
          userEmail: admin.email,
          status: 'joined',
          role: 'member'
        })
        await membership.save()
        console.log(`Added membership for club: ${club.name}`)
      }
    }

    console.log('Memberships added successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addMemberships()
