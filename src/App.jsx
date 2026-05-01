import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('attendance');
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const [allUsers, setAllUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    department: 'COMPANY',
    gender: 'unknown',
    startTime: '2026-03-21T00:00:00',
    endTime: '2030-12-31T23:59:59',
    faceImage: null
  });


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, loginForm);
      if (res.data.success) setIsLoggedIn(true);
    } catch (err) { alert("Login Failed!"); }
  };


  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance`, {
        params: {
          start: startDate,
          end: endDate,
          _t: Date.now()
        }
      });
      console.log("Fresh logs received:", res.data.length);
      setLogs(res.data);
    } catch (err) {
      console.error("Sync error");
    }
  };


  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users?t=${Date.now()}`);
      console.log("Users received in React:", res.data);
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isEditing ? '/update-user' : '/add-user';
      const res = await axios.post(`${API_BASE}${endpoint}`, newUser);
      if (res.data.success) {
        alert(isEditing ? "✅ User Updated!" : "✅ User Registered!");
        resetUserForm();
        fetchAllUsers();
      }
    } catch (err) { alert("❌ Operation failed"); }
    finally { setLoading(false); }
  };


  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Employee ID: ${id}?`)) return;

    try {
      const res = await axios.post(`${API_BASE}/delete-user`, { id: id });

      if (res.data.success) {
        alert("✅ User removed from device!");
        fetchAllUsers();
      } else {
        alert("❌ Failed to delete: " + res.data.message);
      }
    } catch (err) {
      console.error("Delete click error:", err);
      alert("❌ Error connecting to backend.");
    }
  };

  const resetUserForm = () => {
    setNewUser({ id: '', name: '', department: 'COMPANY', gender: 'unknown', startTime: '2026-03-21T00:00:00', endTime: '2030-12-31T23:59:59', faceImage: null });
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setNewUser({ ...newUser, faceImage: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (view === 'attendance') fetchAttendance();
      if (view === 'addUser') fetchAllUsers();
    }
  }, [isLoggedIn, view, startDate, endDate]);

  const filteredLogs = logs.filter(log => {
    const name = (log.name || "User " + log.employeeNoString || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || log.employeeNoString?.includes(searchTerm);
    let matchesStatus = statusFilter === 'all' || log.attendanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(<button key={i} onClick={() => setCurrentPage(i)} style={{ ...pageBtn, background: currentPage === i ? '#3498db' : '#fff', color: currentPage === i ? '#fff' : '#333' }}>{i}</button>);
      }
    }
    return <div style={{ marginTop: '20px', textAlign: 'center' }}>{pages}</div>;
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>System Login</h2>
          <input type="text" placeholder="Username" style={loginInput} onChange={e => setLoginForm({ ...loginForm, user: e.target.value })} required /><br />
          <input type="password" placeholder="Password" style={loginInput} onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })} required /><br />
          <button type="submit" style={loginBtn}>Login to Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <nav style={{ marginBottom: '20px', background: '#2c3e50', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={() => setView('attendance')} style={{ ...navBtn, background: view === 'attendance' ? '#3498db' : '#34495e' }}>Attendance Logs</button>
        <button onClick={() => setView('addUser')} style={{ ...navBtn, background: view === 'addUser' ? '#3498db' : '#34495e' }}>User Management</button>
        <button onClick={() => setIsLoggedIn(false)} style={{ ...navBtn, background: '#e74c3c' }}>Logout</button>
      </nav>

      {view === 'attendance' ? (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Live Logs</h3>
            <small style={{ color: '#27ae60' }}>● Live Connection Active</small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} style={inputStyle} />
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} style={inputStyle} />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={inputStyle}>
              <option value="all">All Status</option>
              <option value="checkIn">Check-In</option>
              <option value="checkOut">Check-Out</option>
            </select>
            <input type="text" placeholder="Search Name/ID..." onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, width: '180px' }} />
            <button onClick={fetchAttendance} style={syncBtn}>Sync Now</button>
          </div>

          <table width="100%" style={{ borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#ecf0f1', textAlign: 'left' }}><th style={tdStyle}>Time</th><th style={tdStyle}>Emp ID</th><th style={tdStyle}>Name</th><th style={tdStyle}>Status</th></tr></thead>
            <tbody>
              {currentItems.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{log.time?.split('+')[0].replace('T', ' ')}</td>
                  <td style={tdStyle}>{log.employeeNoString || "---"}</td>
                  <td style={tdStyle}>{log.name || "User " + log.employeeNoString}</td>
                  <td style={tdStyle}>
                    {log.attendanceStatus === 'checkIn' ? <b style={{ color: 'green' }}>IN</b> :
                      log.attendanceStatus === 'checkOut' ? <b style={{ color: 'red' }}>OUT</b> : <span style={{ color: '#999' }}>LOG</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      ) : (

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px' }}>


          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0 }}>{isEditing ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSaveUser} style={{ display: 'grid', gap: '10px' }}>
              <label style={labelStyle}>Employee ID</label>
              <input type="number" style={inputStyle} value={newUser.id} onChange={e => setNewUser({ ...newUser, id: e.target.value })} disabled={isEditing} required />

              <label style={labelStyle}>Full Name</label>
              <input type="text" style={inputStyle} value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Gender</label>
                  <select style={{ ...inputStyle, width: '100%' }} value={newUser.gender} onChange={e => setNewUser({ ...newUser, gender: e.target.value })}>
                    <option value="unknown">None</option><option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Department</label>
                  <select style={{ ...inputStyle, width: '100%' }} value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="COMPANY">COMPANY</option><option value="HR">HR</option><option value="QA">QA</option><option value="TEAM">TEAM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Valid From (Start)</label>
                <input type="datetime-local" style={loginInput} value={newUser.startTime.substring(0, 16)} onChange={e => setNewUser({ ...newUser, startTime: e.target.value + ":00" })} />
              </div>

              <div>
                <label style={labelStyle}>Valid Until (End)</label>
                <input type="datetime-local" style={loginInput} value={newUser.endTime.substring(0, 16)} onChange={e => setNewUser({ ...newUser, endTime: e.target.value + ":00" })} />
              </div>

              <label style={labelStyle}>Face Photo</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ ...inputStyle, fontSize: '11px' }} />

              <button type="submit" disabled={loading} style={{ ...syncBtn, marginTop: '10px' }}>
                {loading ? "Saving..." : isEditing ? "Update User" : "Register User"}
              </button>
              {isEditing && <button onClick={resetUserForm} style={{ background: '#ccc', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>}
            </form>
          </div>


          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Device Users ({allUsers.length})</h3>
            <table width="100%" style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={tdStyle}>ID</th>
                  <th style={tdStyle}>Name</th>
                  <th style={tdStyle}>Type</th>
                  <th style={tdStyle}>Start Time</th>
                  <th style={tdStyle}>End Time</th>
                  <th style={tdStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length > 0 ? allUsers.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{u.employeeNo}</td>

                    <td style={tdStyle}><b>{u.name}</b></td>

                    <td style={tdStyle}>{u.userType}</td>

                    <td style={tdStyle}>
                      <div style={{ fontSize: '11px' }}>
                        Start: {u.Valid?.beginTime?.replace('T', ' ')}<br />
                        End: {u.Valid?.endTime?.replace('T', ' ')}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setNewUser({
                            id: u.employeeNo,
                            name: u.name,
                            department: u.departmentName || 'COMPANY',
                            gender: u.gender || 'unknown',
                            startTime: u.Valid?.beginTime || "",
                            endTime: u.Valid?.endTime || ""
                          });
                        }}
                        style={{ color: '#3498db', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}
                      >Edit</button>
                      <button onClick={() => handleDelete(u.employeeNo)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading users...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const loginInput = { padding: '12px', width: '250px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' };
const loginBtn = { padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const navBtn = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '130px' };
const labelStyle = { fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const syncBtn = { padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const tdStyle = { padding: '15px 10px', borderBottom: '1px solid #eee' };
const pageBtn = { padding: '8px 14px', margin: '0 2px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' };
const pageActionBtn = { padding: '8px 12px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#f8f9fa', fontSize: '13px', color: '#2c3e50' };

export default App;