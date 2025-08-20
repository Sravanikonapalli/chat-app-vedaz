import React, { useState } from 'react';
import { register } from '../api';
import '../styles/styles.css'


export default function Signup({ onAuth, onSwitch }) {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [err, setErr] = useState(null);


async function submit(e) {
e.preventDefault();
setErr(null);
const res = await register({ name, email, password });
if (res && res.token) {
localStorage.setItem('token', res.token);
onAuth(res.user);
} else {
setErr(res?.message || 'Signup failed');
}
}


return (
<div className="auth-box">
<h3>Sign up</h3>
<form onSubmit={submit}>
<input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<button className="btn primary" type="submit">Create account</button>
</form>
<div style={{marginTop:12}}>
<span>Already have an account?</span>
<button className="btn" onClick={onSwitch} style={{marginLeft:8}}>Login</button>
</div>
{err && <div className="small" style={{color:'red'}}>{err}</div>}
</div>
);
}