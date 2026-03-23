// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_BASE = 'http://localhost:5000/api';

// const getLocalDate = () => {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// };

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [logs, setLogs] = useState([]);
//   const [startDate, setStartDate] = useState(getLocalDate());
//   const [endDate, setEndDate] = useState(getLocalDate());
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/attendance`, {
//         params: { start: startDate, end: endDate }
//       });
//       setLogs(res.data);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => {
//     if (isLoggedIn) fetchAttendance();
//     const interval = setInterval(() => { if(isLoggedIn) fetchAttendance(); }, 5000);
//     return () => clearInterval(interval);
//   }, [isLoggedIn, startDate, endDate]);

//   const filteredLogs = logs.filter(log => {
//     const name = (log.name || "User " + log.employeeNoString).toLowerCase();
//     return name.includes(searchTerm.toLowerCase()) || log.employeeNoString?.includes(searchTerm);
//   });

//   const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
//   const currentItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   if (!isLoggedIn) return (
//     <div style={{textAlign:'center', padding:'100px'}}>
//       <h2>Hikvision Login</h2>
//       <button onClick={() => setIsLoggedIn(true)} style={{padding:'10px 40px', cursor:'pointer'}}>Enter Dashboard</button>
//     </div>
//   );

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
//       <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h3>Attendance Logs: {startDate === endDate ? startDate : `${startDate} to ${endDate}`}</h3>

//         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
//           <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
//           <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
//           <input type="text" placeholder="Search Name/ID..." onChange={e => setSearchTerm(e.target.value)} style={inputStyle} />
//           <button onClick={fetchAttendance} style={btnStyle}>Sync Now</button>
//         </div>

//         <table width="100%" style={{ borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
//               <th style={tdStyle}>Date & Time</th>
//               <th style={tdStyle}>Emp ID</th>
//               <th style={tdStyle}>Name</th>
//               <th style={tdStyle}>In/Out</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentItems.map((log, i) => (
//               <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
//                 <td style={tdStyle}>{log.time?.split('+')[0].replace('T', ' ')}</td>
//                 <td style={tdStyle}>{log.employeeNoString || "---"}</td>
//                 <td style={tdStyle}>{log.name || "User " + log.employeeNoString}</td>
//                 <td style={tdStyle}>
//                   {log.attendanceStatus === 'checkIn' ? <b style={{color:'green'}}>IN</b> : 
//                    log.attendanceStatus === 'checkOut' ? <b style={{color:'red'}}>OUT</b> : 
//                    <span style={{color:'#999'}}>LOG</span>}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div style={{marginTop:'20px', textAlign:'center'}}>
//           {Array.from({length: totalPages}, (_, i) => (
//             <button key={i} onClick={() => setCurrentPage(i+1)} style={{margin:'2px', background: currentPage === i+1 ? '#3498db' : '#fff', color: currentPage === i+1 ? '#fff' : '#000'}}>
//               {i+1}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' };
// const btnStyle = { padding: '9px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const tdStyle = { padding: '12px 10px', borderBottom: '1px solid #eee' };

// export default App;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_BASE = 'http://localhost:5000/api';

// const getTodayDate = () => {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// };

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [view, setView] = useState('attendance');
//   const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
//   const [logs, setLogs] = useState([]);
//   const [startDate, setStartDate] = useState(getTodayDate());
//   const [endDate, setEndDate] = useState(getTodayDate());
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // 1. Authentication Logic
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(`${API_BASE}/login`, loginForm);
//       if (res.data.success) setIsLoggedIn(true);
//     } catch (err) {
//       alert("Login Failed! Use admin / cctv@321");
//     }
//   };

//   // 2. Fetch Data Logic
//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/attendance`, {
//         params: { start: startDate, end: endDate }
//       });
//       setLogs(res.data);
//     } catch (err) { console.error("Sync error"); }
//   };

//   useEffect(() => {
//     if (isLoggedIn) {
//       fetchAttendance();
//       const interval = setInterval(fetchAttendance, 5000); // Auto-refresh
//       return () => clearInterval(interval);
//     }
//   }, [isLoggedIn, startDate, endDate]);

//   // 3. Filter & Pagination Logic
//   const filteredLogs = logs.filter(log => {
//     const name = (log.name || "User " + log.employeeNoString || "").toLowerCase();
//     return name.includes(searchTerm.toLowerCase()) || log.employeeNoString?.includes(searchTerm);
//   });

//   const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
//   const currentItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   // --- LOGIN PAGE VIEW ---
//   if (!isLoggedIn) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
//         <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
//           <h2 style={{ marginBottom: '20px', color: '#333' }}>System Login</h2>
//           <input type="text" placeholder="Username" style={loginInput} onChange={e => setLoginForm({ ...loginForm, user: e.target.value })} required /><br />
//           <input type="password" placeholder="Password" style={loginInput} onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })} required /><br />
//           <button type="submit" style={loginBtn}>Login to Dashboard</button>
//         </form>
//       </div>
//     );
//   }

//   // --- MAIN DASHBOARD VIEW ---
//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
//       <nav style={{ marginBottom: '20px', background: '#2c3e50', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
//         <button onClick={() => setView('attendance')} style={navBtn}>Attendance Logs</button>
//         <button onClick={() => setView('addUser')} style={navBtn}>User Management</button>
//         <button onClick={() => setIsLoggedIn(false)} style={{ ...navBtn, background: '#e74c3c' }}>Logout</button>
//       </nav>

//       {view === 'attendance' ? (
//         <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//             <h3 style={{ margin: 0 }}>Live Logs: {startDate === endDate ? startDate : `${startDate} to ${endDate}`}</h3>
//             <small style={{ color: '#27ae60' }}>● Live Connection Active</small>
//           </div>

//           <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
//             <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} style={inputStyle} />
//             <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} style={inputStyle} />
//             <input type="text" placeholder="Search Name/ID..." onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, width: '200px' }} />
//             <button onClick={fetchAttendance} style={syncBtn}>Sync Now</button>
//           </div>

//           <table width="100%" style={{ borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
//                 <th style={tdStyle}>Date & Time</th>
//                 <th style={tdStyle}>Emp ID</th>
//                 <th style={tdStyle}>Name</th>
//                 <th style={tdStyle}>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.map((log, i) => (
//                 <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
//                   <td style={tdStyle}>{log.time?.split('+')[0].replace('T', ' ')}</td>
//                   <td style={tdStyle}>{log.employeeNoString || "---"}</td>
//                   <td style={tdStyle}>{log.name || "User " + log.employeeNoString}</td>
//                   <td style={tdStyle}>
//                     {log.attendanceStatus === 'checkIn' ? <b style={{ color: 'green' }}>IN</b> :
//                       log.attendanceStatus === 'checkOut' ? <b style={{ color: 'red' }}>OUT</b> :
//                         <span style={{ color: '#999' }}>LOG</span>}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {totalPages > 1 && (
//             <div style={{ marginTop: '20px', textAlign: 'center' }}>
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ ...pageBtn, background: currentPage === i + 1 ? '#3498db' : '#fff', color: currentPage === i + 1 ? '#fff' : '#000' }}>
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div style={{ maxWidth: '400px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '12px' }}>
//           <h3>Add New Employee</h3>
//           <p style={{ fontSize: '12px', color: '#666' }}>Register name and ID to the device database.</p>
//           <input type="text" placeholder="ID (e.g. 10)" style={{ ...loginInput, width: '100%' }} />
//           <input type="text" placeholder="Full Name" style={{ ...loginInput, width: '100%' }} />
//           <button style={{ ...syncBtn, width: '100%', marginTop: '10px' }}>Register User</button>
//         </div>
//       )}
//     </div>
//   );
// }

// // STYLES
// const loginInput = { padding: '12px', width: '250px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' };
// const loginBtn = { padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
// const navBtn = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '6px', color: 'white', background: '#34495e', fontWeight: 'bold' };
// const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd' };
// const syncBtn = { padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
// const tdStyle = { padding: '15px 10px', borderBottom: '1px solid #eee' };
// const pageBtn = { padding: '8px 12px', margin: '2px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px' };

// export default App;

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

  // --- ADD USER STATE ---
  const [newUser, setNewUser] = useState({ id: '', name: '', department: 'COMPANY' });
  const [loading, setLoading] = useState(false);

  // 1. Authentication Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, loginForm);
      if (res.data.success) setIsLoggedIn(true);
    } catch (err) {
      alert("Login Failed! Use admin / cctv@321");
    }
  };

  // 2. Fetch Data Logic
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance`, {
        params: { start: startDate, end: endDate }
      });
      setLogs(res.data);
    } catch (err) { console.error("Sync error"); }
  };

  // --- 3. ADD USER LOGIC ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.id || !newUser.name) return alert("Please fill all fields");

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/add-user`, newUser);
      if (res.data.success) {
        alert("✅ Success: User registered on Hikvision device!");
        setNewUser({ id: '', name: '' }); // Clear form
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Failed to add user"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAttendance();
      const interval = setInterval(fetchAttendance, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, startDate, endDate]);

  // Filter & Pagination Logic
  const filteredLogs = logs.filter(log => {
    const name = (log.name || "User " + log.employeeNoString || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || log.employeeNoString?.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter === 'checkIn') {
      matchesStatus = log.attendanceStatus === 'checkIn' || log.minor === 75;
    } else if (statusFilter === 'checkOut') {
      matchesStatus = log.attendanceStatus === 'checkOut' || log.minor === 76;
    }
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentItems = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const windowSize = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - windowSize && i <= currentPage + windowSize)) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)} style={{ ...pageBtn, background: currentPage === i ? '#3498db' : '#fff', color: currentPage === i ? '#fff' : '#333', fontWeight: currentPage === i ? 'bold' : 'normal', border: currentPage === i ? '1px solid #3498db' : '1px solid #ddd' }}>
            {i}
          </button>
        );
      } else if (i === currentPage - windowSize - 1 || i === currentPage + windowSize + 1) {
        pages.push(<span key={i} style={{ padding: '0 5px', color: '#999' }}>...</span>);
      }
    }

    return (
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} style={pageActionBtn}>« First</button>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={pageActionBtn}>‹ Prev</button>
        {pages}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={pageActionBtn}>Next ›</button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} style={pageActionBtn}>Last »</button>
        <div style={{ marginLeft: '15px', fontSize: '13px', color: '#666' }}>Page <b>{currentPage}</b> of {totalPages} ({filteredLogs.length} logs)</div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>System Login</h2>
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
            <h3 style={{ margin: 0 }}>Live Logs: {startDate === endDate ? startDate : `${startDate} to ${endDate}`}</h3>
            <small style={{ color: '#27ae60' }}>● Live Connection Active</small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div><label style={labelStyle}>From Date</label><br /><input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} style={inputStyle} /></div>
            <div><label style={labelStyle}>To Date</label><br /><input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} style={inputStyle} /></div>
            <div><label style={labelStyle}>Status</label><br />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                <option value="all">All Status</option>
                <option value="checkIn">Check-In</option>
                <option value="checkOut">Check-Out</option>
              </select>
            </div>
            <div><label style={labelStyle}>Search</label><br /><input type="text" placeholder="Name/ID..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, width: '180px' }} /></div>
            <button onClick={fetchAttendance} style={syncBtn}>Sync Now</button>
          </div>

          <table width="100%" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
                <th style={tdStyle}>Date & Time</th>
                <th style={tdStyle}>Emp ID</th>
                <th style={tdStyle}>Name</th>
                <th style={tdStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((log, i) => {
                const isOut = log.attendanceStatus === 'checkOut' || log.attendanceStatus === 1 || log.minor === 76;
                const isIn = log.attendanceStatus === 'checkIn' || log.attendanceStatus === 0 || log.minor === 75;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{log.time?.split('+')[0].replace('T', ' ')}</td>
                    <td style={tdStyle}>{log.employeeNoString || "---"}</td>
                    <td style={tdStyle}>{log.name || "User " + log.employeeNoString}</td>
                    <td style={tdStyle}>
                      {isOut ? <b style={{ color: '#e74c3c', background: '#fdedec', padding: '3px 8px', borderRadius: '4px' }}>OUT</b> :
                        isIn ? <b style={{ color: '#27ae60', background: '#eafaf1', padding: '3px 8px', borderRadius: '4px' }}>IN</b> :
                          <span style={{ color: '#999' }}>LOG</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      ) : (
        /* --- ADD USER VIEW --- */
        <div style={{ maxWidth: '450px', margin: 'auto', background: 'white', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Register New Employee</h3>

          <form onSubmit={handleAddUser}>
            <label style={labelStyle}>Employee ID</label>
            <input
              type="number"
              style={{ ...loginInput, width: '100%', boxSizing: 'border-box' }}
              value={newUser.id}
              onChange={e => setNewUser({ ...newUser, id: e.target.value })}
              required
            />

            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              style={{ ...loginInput, width: '100%', boxSizing: 'border-box' }}
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              required
            />

            {/* --- ADDED DEPARTMENT DROPDOWN --- */}
            <label style={labelStyle}>Department</label>
            <select
              style={{ ...loginInput, width: '100%', boxSizing: 'border-box', height: '45px' }}
              value={newUser.department}
              onChange={e => setNewUser({ ...newUser, department: e.target.value })}
            >
              <option value="COMPANY">COMPANY</option>
              <option value="HR">HR</option>
              <option value="QA">QA</option>
              <option value="TEAM">TEAM</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              style={{ ...syncBtn, width: '100%', marginTop: '20px', height: '50px' }}
            >
              {loading ? "Adding..." : "Register User to Device"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// STYLES
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