const bcrypt = require('bcrypt')

// Get password from command line argument or use default
const password = process.argv[2] || 'Admin@123456'

if (!password) {
  console.error('Please provide a password as argument')
  console.log('Usage: node scripts/generate-hash.cjs "YourPassword123"')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)

console.log(`Password: ${password}`)
console.log(`Hash: ${hash}`)
console.log('\nCopy the hash value above for your MongoDB admin record.')
