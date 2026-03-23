// import express from 'express';
// import cors from 'cors';
// import DigestFetch from 'digest-fetch';
// import { Parser } from 'xml2js';

// const app = express();
// app.use(cors());
// app.use(express.json());

// const xmlParser = new Parser({ explicitArray: false, mergeAttrs: true, trim: true });
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// const DEVICE_IP = '192.168.1.2';
// const USERNAME = 'admin';
// const PASSWORD = 'cctv@321';
// const BASE_URL = `https://${DEVICE_IP}/ISAPI`;

// async function parseResponse(text) {
//     if (!text) return {};
//     if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
//         return await xmlParser.parseStringPromise(text);
//     }
//     try { return JSON.parse(text); } catch (e) { return {}; }
// }

// app.post('/api/login', (req, res) => {
//     const { user, pass } = req.body;
//     if (user === 'admin' && pass === PASSWORD) res.json({ success: true });
//     else res.status(401).json({ success: false });
// });

// app.get('/api/attendance', async (req, res) => {
//     const client = new DigestFetch(USERNAME, PASSWORD);
//     const url = `${BASE_URL}/AccessControl/AcsEvent?format=json`;
//     const { start, end } = req.query;

//     // Format: 2026-03-21T00:00:00
//     const startTime = start ? `${start}T00:00:00` : "2026-03-01T00:00:00";
//     const endTime = end ? `${end}T23:59:59` : "2026-03-31T23:59:59";

//     let allEvents = [];
//     let currentPos = 0;
//     const searchID = Date.now().toString().substring(7);

//     try {
//         console.log(`Fetching logs from ${startTime} to ${endTime}...`);

//         // We fetch up to 3 pages (90 logs) to ensure we get all of Today + Yesterday
//         for (let i = 0; i < 3; i++) {
//             const payload = {
//                 "AcsEventCond": {
//                     "searchID": searchID,
//                     "searchResultPosition": currentPos,
//                     "maxResults": 30,
//                     "major": 0,
//                     "minor": 0,
//                     "startTime": startTime,
//                     "endTime": endTime,
//                     "timeReverseOrder": true // GET MARCH 21 FIRST
//                 }
//             };

//             const response = await client.fetch(url, { method: 'POST', body: JSON.stringify(payload) });
//             const data = await parseResponse(await response.text());

//             // Your specific key is 'AcsEvent'
//             const events = data?.AcsEvent?.InfoList || [];
//             const eventArray = Array.isArray(events) ? events : [events];

//             if (eventArray.length === 0 || !eventArray[0].time) break;

//             allEvents = [...allEvents, ...eventArray];
//             currentPos += eventArray.length;
//             if (eventArray.length < 30) break;
//         }

//         console.log(`Successfully sent ${allEvents.length} logs to React.`);
//         res.json(allEvents);

//     } catch (error) {
//         console.error("Backend Error:", error.message);
//         res.status(500).json([]);
//     }
// });

// app.listen(5000, () => console.log('Backend running on http://localhost:5000'));

import express from 'express';
import cors from 'cors';
import DigestFetch from 'digest-fetch';
import { Parser } from 'xml2js';

const app = express();
app.use(cors());
app.use(express.json());

const xmlParser = new Parser({ explicitArray: false, mergeAttrs: true, trim: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const DEVICE_IP = '192.168.1.2';
const USERNAME = 'admin';
const PASSWORD = 'cctv@321';
const BASE_URL = `https://${DEVICE_IP}/ISAPI`;

async function parseResponse(text) {
    if (!text) return {};
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
        return await xmlParser.parseStringPromise(text);
    }
    try { return JSON.parse(text); } catch (e) { return {}; }
}

// --- API: LOGIN (Matches the React form) ---
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// --- API: ATTENDANCE (Optimized for your device structure) ---
app.get('/api/attendance', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/AcsEvent?format=json`;
    const { start, end } = req.query;

    const startTime = start ? `${start}T00:00:00` : "2026-03-01T00:00:00";
    const endTime = end ? `${end}T23:59:59` : "2026-03-31T23:59:59";

    let bulkLogs = [];
    let currentPos = 0;
    const searchID = Date.now().toString().substring(7);

    try {
        console.log(`[${new Date().toLocaleTimeString()}] Fetching bulk logs (Target: 300)...`);

        // We run the loop 10 times to get 300 logs (10 pages * 30 logs)
        for (let page = 0; page < 10; page++) {
            const payload = {
                "AcsEventCond": {
                    "searchID": searchID,
                    "searchResultPosition": currentPos, // Moves from 0 -> 30 -> 60...
                    "maxResults": 30, // Device hard limit
                    "major": 0,
                    "minor": 0,
                    "startTime": startTime,
                    "endTime": endTime,
                    "timeReverseOrder": true
                }
            };

            const response = await client.fetch(url, { method: 'POST', body: JSON.stringify(payload) });
            const rawText = await response.text();
            const data = await parseResponse(rawText);

            const events = data?.AcsEvent?.InfoList || [];
            const eventArray = Array.isArray(events) ? events : [events];

            // If this page is empty, stop looping
            if (eventArray.length === 0 || !eventArray[0]?.time) {
                console.log(`No more data found at position ${currentPos}.`);
                break;
            }

            bulkLogs = [...bulkLogs, ...eventArray];
            console.log(`Fetched page ${page + 1}: Total logs so far: ${bulkLogs.length}`);

            // If the device sent less than 30, it means there are no more logs
            if (eventArray.length < 30) break;

            // Move the pointer for the next request
            currentPos += 30;
        }

        console.log(`Final transmission: ${bulkLogs.length} logs sent to React.`);
        res.json(bulkLogs);

    } catch (error) {
        console.error("Bulk Fetch Error:", error.message);
        res.status(500).json([]);
    }
});

// --- API: ADD USER RECORD ---
app.post('/api/add-user', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/UserInfo/Record?format=json`;
    
    // 1. Receive department from React
    const { id, name, department } = req.body;

    const payload = {
        "UserInfo": {
            "employeeNo": id.toString(),
            "name": name,
            "departmentName": department,
            "userType": "normal",
            "Valid": {
                "enable": true,
                "beginTime": "2024-01-01T00:00:00",
                "endTime": "2030-12-31T23:59:59"
            }
        }
    };

    try {
        console.log(`Registering: ${name} in Dept: ${department}`);
        const response = await client.fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await parseResponse(await response.text());
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));