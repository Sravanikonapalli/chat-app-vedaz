# Realtime Chat App

A **full-stack realtime chat application** with authentication, 1:1 messaging, presence, and message statuses.

---

## Setup

### 1. Clone Repo

```bash
git clone https://github.com/Sravanikonapalli/chat-app-vedaz.git
cd chat-app-vedaz
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat
JWT_SECRET=supersecretkey
```

Run backend:

```bash
npm run dev   # dev with nodemon
```

Backend runs at [http://localhost:5000](http://localhost:5000)

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm start
```

Frontend runs at [http://localhost:3000](http://localhost:3000)

---

##  Running the App

1. Start backend (`npm run dev` in `backend/`)
2. Start frontend (`npm start` in `frontend/`)
3. Open [http://localhost:3000](http://localhost:3000) in browser
4. Register or login with sample users (below)
5. Select a user from the list to start chatting

---

##  Sample Users

### Option 1: Register via UI

- Open [http://localhost:3000/register](http://localhost:3000/register)
- Create User 1 (e.g. `alice@example.com` / `password123`)
- Create User 2 (e.g. `bob@example.com` / `password123`)
- Login with both in two different browser windows/tabs

### Option 2: Seed Users (directly in DB)

Insert documents into `users` collection:

```json
[
    {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "<bcrypt hash of password123>"
    },
    {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "<bcrypt hash of password123>"
    }
]
```

Now login with:

- Alice → `alice@example.com` / `password123`
- Bob → `bob@example.com` / `password123`

---

## Notes

- Run both backend & frontend for app to work.
- JWT token is stored in localStorage.
- Socket.IO handles realtime presence, typing, and message updates.
- Use two browsers/logins to test realtime messaging.

---

## Example Flow

1. Alice logs in → sees Bob in user list
2. Alice sends "Hi Bob" → message shows as Sent
3. If Bob is online → status updates to Delivered
4. When Bob opens chat → status updates to Read