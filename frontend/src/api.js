const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// define headers function
function headers() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function get(path) {
  const res = await fetch(`${API}${path}`, {
    method: "GET",
    headers: headers(),
  });
  if (res.status === 401) return null;
  return res.json();
}

export async function register({ name, email, password }) {
  return post("/auth/register", { name, email, password });
}

export async function login({ email, password }) {
  return post("/auth/login", { email, password });
}

export async function getUsers() {
  return get("/users");
}

export async function getMessages(otherId, page = 1, limit = 100) {
  return get(`/conversations/${otherId}/messages?page=${page}&limit=${limit}`);
}

export async function getMe() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // attempt to fetch users as a cheap authenticated check
  const me = await get("/users");

  if (me) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.id };
    } catch (e) {
      return { id: null };
    }
  }
  return null;
}
