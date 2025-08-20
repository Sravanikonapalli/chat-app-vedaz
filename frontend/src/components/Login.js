import React, { useState } from 'react';
import { login } from '../api';
import '../styles/styles.css'


export default function Login({ onAuth, onSwitch }) {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [err, setErr] = useState(null);


async function submit(e) {
e.preventDefault();
setErr(null);
const res = await login({ email, password });
if (res && res.token) {
localStorage.setItem('token', res.token);
onAuth(res.user);
} else {
setErr(res?.message || 'Login failed');
}
}


return (
<div className="auth-box">
<h3>Login</h3>
<form onSubmit={submit}>
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<button className="btn primary" type="submit">Login</button>
</form>
<div style={{marginTop:12}}>
<span>Don't have an account?</span>
<button className="btn" onClick={onSwitch} style={{marginLeft:8}}>Sign up</button>
</div>
{err && <div className="small" style={{color:'red'}}>{err}</div>}
</div>
);
}