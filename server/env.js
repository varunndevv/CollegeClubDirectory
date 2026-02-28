import dotenv from "dotenv"
import fs from "fs"
import path from "path"

const ENV_FILES = [".env", ".env.local"]
for (const file of ENV_FILES) {
  const fullPath = path.resolve(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: true })
  }
}
