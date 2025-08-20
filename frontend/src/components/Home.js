import React, { useEffect, useState } from 'react';
import { getUsers } from '../api';
import UserItem from './UserItem';
import '../styles/styles.css'


export default function Home({ me, onOpenChat, onLogout }) {
const [users, setUsers] = useState([]);


useEffect(() => {
let mounted = true;
async function load() {
const data = await getUsers();
if (mounted && Array.isArray(data)) setUsers(data);
}
load();
return () => { mounted = false; };
}, []);


return (
<div>
<div className="header">
<div>Welcome</div>
<div>
<button className="btn" onClick={onLogout}>Logout</button>
</div>
</div>
<div className="container">
<div className="sidebar">
{users.map(u => <UserItem key={u._id} user={u} onClick={() => onOpenChat(u)} />)}
</div>
<div className="content center">
<div>Select a user to start chatting</div>
</div>
</div>
</div>
);
}