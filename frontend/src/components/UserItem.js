import React from 'react';
import '../styles/styles.css'


export default function UserItem({ user, onClick }) {
return (
<div className="user-item" onClick={() => onClick(user)}>
<div className="avatar">{(user.name || '?').slice(0,1).toUpperCase()}</div>
<div className="user-meta">
<div style={{display:'flex', alignItems:'center'}}>
<div className="user-name">{user.name}</div>
{user.online && <div className="online-dot" title="Online" />}
</div>
<div className="last-msg">{user.lastMessageText || 'Say hi!'}</div>
</div>
</div>
);
}