export default function sanitizeUser(user) {
  if (!user) return null
  const plain = typeof user.toJSON === "function" ? user.toJSON() : { ...user }
  delete plain.passwordHash
  return plain
}

