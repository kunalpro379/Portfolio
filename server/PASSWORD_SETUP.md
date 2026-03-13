# Password Management System

## Overview
This application uses bcrypt to securely hash and store passwords in MongoDB instead of hardcoding them in the source code.

## Setup

### 1. Initialize Password in Database
Run this command once to set up the password in the database:

```bash
cd server
node scripts/initPassword.js
```

This will:
- Hash the password `` using bcrypt
- Store it in MongoDB under the key `TODO_PASSWORD`
- The plain password is NEVER stored in the database

### 2. Password Usage
The password is used for:
- Viewing private tasks/todos
- Deleting tasks/todos
- Deleting guide notes and titles
- Updating diagrams/architectures
- Deleting diagrams/architectures

### 3. How It Works
1. **Storage**: Password is hashed with bcrypt (salt rounds: 10) and stored in the `passwords` collection
2. **Verification**: When a user enters a password, it's compared with the hashed version using `bcrypt.compare()`
3. **Security**: The plain password never appears in the database or logs

### 4. Changing the Password
To change the password, edit `server/scripts/initPassword.js`:

```javascript
const plainPassword = 'YOUR_NEW_PASSWORD';
```

Then run:
```bash
node scripts/initPassword.js
```

### 5. Database Schema
```javascript
{
  key: 'TODO_PASSWORD',           // Unique identifier
  hashedPassword: '$2a$10$...',   // Bcrypt hashed password
  updatedAt: Date                 // Last update timestamp
}
```

## Security Benefits
- ✅ Password is hashed using bcrypt (industry standard)
- ✅ Salt is automatically generated for each hash
- ✅ Plain password never stored in database
- ✅ Resistant to rainbow table attacks
- ✅ Centralized password management
- ✅ Easy to update password without code changes

## API Endpoints Using Password
- `GET /api/todos/:todoId?password=xxx` - View private todo
- `DELETE /api/todos/:todoId` - Delete todo (password in body)
- `DELETE /api/guide-notes/guides/:guideId` - Delete guide (password in body)
- `DELETE /api/guide-notes/guides/:guideId/titles/:titleId` - Delete title (password in body)
- `PUT /api/diagrams/:canvasId` - Update diagram (password in body)
- `DELETE /api/diagrams/:canvasId` - Delete diagram (password in body)
