import express from 'express';
import cors from 'cors';
import DigestFetch from 'digest-fetch';
import { Parser } from 'xml2js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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


app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});


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


        for (let page = 0; page < 10; page++) {
            const payload = {
                "AcsEventCond": {
                    "searchID": searchID,
                    "searchResultPosition": currentPos,
                    "maxResults": 30,
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


            if (eventArray.length === 0 || !eventArray[0]?.time) {
                console.log(`No more data found at position ${currentPos}.`);
                break;
            }

            bulkLogs = [...bulkLogs, ...eventArray];
            console.log(`Fetched page ${page + 1}: Total logs so far: ${bulkLogs.length}`);


            if (eventArray.length < 30) break;


            currentPos += 30;
        }

        console.log(`Final transmission: ${bulkLogs.length} logs sent to React.`);
        res.json(bulkLogs);

    } catch (error) {
        console.error("Bulk Fetch Error:", error.message);
        res.status(500).json([]);
    }
});


app.post('/api/add-user', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);


    const { id, name, department, gender, startTime, endTime, faceImage } = req.body;


    const userPayload = {
        "UserInfo": {
            "employeeNo": id.toString(),
            "name": name,
            "departmentName": department || "COMPANY",
            "gender": gender || "unknown",
            "userType": "normal",
            "Valid": {
                "enable": true,
                "beginTime": startTime.replace(' ', 'T'),
                "endTime": endTime.replace(' ', 'T'),
            }
        }
    };

    try {
        console.log(`[Step 1/2] Registering User Profile: ${name}...`);
        const userResponse = await client.fetch(`${BASE_URL}/AccessControl/UserInfo/Record?format=json`, {
            method: 'POST',
            body: JSON.stringify(userPayload)
        });

        const userData = await parseResponse(await userResponse.text());


        if (faceImage) {

            const cleanBase64 = faceImage.replace(/\s/g, '');

            console.log(`[Step 2/2] Uploading Face Image for ID: ${id}...`);

            const facePayload = {
                "faceLibType": "static",
                "FDLibID": "1",
                "FPID": id.toString(),
                "faceData": cleanBase64
            };

            const faceResponse = await client.fetch(`${BASE_URL}/Intelligent/FDLib/FaceDataRecord?format=json`, {
                method: 'POST',
                body: JSON.stringify(facePayload)
            });

            const faceResult = await parseResponse(await faceResponse.text());
            console.log("Face Upload Result:", faceResult.statusString || "Complete");
        }

        res.json({
            success: true,
            message: "User and Face Data processed successfully",
            deviceResponse: userData
        });

    } catch (error) {
        console.error("Add User Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/UserInfo/Search?format=json`;

    const payload = {
        "UserInfoSearchCond": {
            "searchID": "1",
            "maxResults": 100,
            "searchResultPosition": 0
        }
    };

    try {
        const response = await client.fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        const data = await parseResponse(rawText);
        const users = data?.UserInfoSearch?.UserInfo ||
            data?.UserInfoSearchOut?.UserInfo ||
            data?.UserInfo?.UserInfoList ||
            [];

        const userArray = Array.isArray(users) ? users : [users];

        console.log(`[User Sync] Successfully matched ${userArray.length} users from device.`);
        res.json(userArray);

    } catch (error) {
        console.error("User list fetch failed:", error.message);
        res.json([]);
    }
});

app.post('/api/update-user', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/UserInfo/Modify?format=json`;
    const { id, name, department, gender } = req.body;

    const payload = {
        "UserInfo": {
            "employeeNo": id.toString(),
            "name": name,
            "departmentName": department,
            "gender": gender,
            "userType": "normal"
        }
    };

    try {
        const response = await client.fetch(url, { method: 'PUT', body: JSON.stringify(payload) });
        const data = await parseResponse(await response.text());
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



app.post('/api/delete-user', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/UserInfo/Delete?format=json`;

    const { id } = req.body;
    const payload = {
        "UserInfoDelCond": {
            "EmployeeNoList": [
                {
                    "employeeNo": id.toString()
                }
            ]
        }
    };

    try {
        console.log(`[DELETE] Attempting to remove User ID: ${id}...`);

        const response = await client.fetch(url, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        const data = await parseResponse(rawText);

        console.log("Device Delete Response:", JSON.stringify(data));

        if (data.statusString === "OK" || data.statusCode === 1) {
            console.log(`User ${id} deleted successfully.`);
            res.json({ success: true, message: "User deleted" });
        } else {
            res.status(400).json({
                success: false,
                message: data.errorMsg || "Device rejected delete request"
            });
        }
    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ success: false, message: "Backend connection error" });
    }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));