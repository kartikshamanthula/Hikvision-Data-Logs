import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('attendance');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newUser, setNewUser] = useState({ id: '', name: '' });
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });


  const fetchAttendance = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/attendance`);


      console.log("Data arriving in React:", res.data);

      setLogs(res.data);
    } catch (err) {
      console.error("Auto-fetch error:", err.message);
    }
    finally { if (showLoading) setLoading(false); }
  };


  useEffect(() => {
    let interval;
    if (isLoggedIn && view === 'attendance') {
      fetchAttendance();
      interval = setInterval(() => {
        fetchAttendance(false);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, view]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, loginForm);
      if (res.data.success) setIsLoggedIn(true);
    } catch (err) { alert("Login Failed!"); }
  };



  const filteredLogs = logs.filter(log => {

    const displayName = log.name || log.userName || "User " + (log.employeeNoString || "");
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeNoString?.includes(searchTerm);


    const matchesStatus = statusFilter === 'all' || log.attendanceStatus?.toString() === statusFilter;


    const cleanTime = log.time ? log.time.replace(" ", "T") : null;
    if (!cleanTime) return false;

    const logDate = new Date(cleanTime).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    let matchesDate = true;
    if (start && logDate < start) matchesDate = false;
    if (end && logDate > end) matchesDate = false;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const currentItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h2>Dashboard Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" style={filterInput} onChange={e => setLoginForm({ ...loginForm, user: e.target.value })} /><br /><br />
          <input type="password" placeholder="Password" style={filterInput} onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })} /><br /><br />
          <button type="submit" style={refreshBtn}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <nav style={{ marginBottom: '20px', background: '#2c3e50', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={() => setView('attendance')} style={navBtn}>Attendance Logs</button>
        <button onClick={() => setView('addUser')} style={navBtn}>User Management</button>
        <button onClick={() => setIsLoggedIn(false)} style={{ ...navBtn, background: '#e74c3c' }}>Logout</button>
      </nav>

      {view === 'attendance' ? (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Attendance Records (Auto-refreshing)</h3>
            <span style={{ fontSize: '12px', color: '#27ae60' }}>● Live Connection Active</span>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div><label style={labelStyle}>Search</label><br /><input type="text" placeholder="Name or ID..." style={filterInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div><label style={labelStyle}>Start Date</label><br /><input type="date" style={filterInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><label style={labelStyle}>End Date</label><br /><input type="date" style={filterInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <div><label style={labelStyle}>Status</label><br />
              <select style={filterInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="checkIn">Check-In</option>
                <option value="checkOut">Check-Out</option>
              </select>
            </div>
            <button onClick={() => fetchAttendance()} style={refreshBtn}>Sync Now</button>
          </div>

          <table width="100%" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
                <th style={tdStyle}>Date & Time</th>
                <th style={tdStyle}>Emp ID</th>
                <th style={tdStyle}>Name</th>
                <th style={tdStyle}>In/Out</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{new Date(log.time).toLocaleString()}</td>
                  <td style={tdStyle}>{log.employeeNoString}</td>
                  <td style={tdStyle}>{log.name || log.userName || "User " + log.employeeNoString}</td>
                  <td style={tdStyle}>{log.attendanceStatus === 'checkIn' || log.attendanceStatus === 0 ? <b style={{ color: 'green' }}>IN</b> : <b style={{ color: 'red' }}>OUT</b>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ ...pageBtn, background: currentPage === i + 1 ? '#3498db' : '#fff', color: currentPage === i + 1 ? '#fff' : '#333' }}>
                {i + 1}
              </button>
            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '450px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px' }}>
          <h3>Add New User</h3>
          <form onSubmit={async (e) => { e.preventDefault(); await axios.post(`${API_BASE}/add-user`, newUser); alert("User Added!"); setNewUser({ id: '', name: '' }); }}>
            <input style={{ ...filterInput, width: '100%', marginBottom: '10px' }} type="text" placeholder="ID" value={newUser.id} onChange={e => setNewUser({ ...newUser, id: e.target.value })} required />
            <input style={{ ...filterInput, width: '100%', marginBottom: '10px' }} type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
            <button type="submit" style={{ ...refreshBtn, width: '100%' }}>Save User</button>
          </form>
        </div>
      )}
    </div>
  );
}

const navBtn = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '6px', background: '#34495e', color: 'white' };
const filterInput = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const refreshBtn = { padding: '11px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const tdStyle = { padding: '12px 10px', fontSize: '14px' };
const labelStyle = { fontSize: '11px', color: '#7f8c8d' };
const pageBtn = { padding: '8px 12px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' };

export default App;