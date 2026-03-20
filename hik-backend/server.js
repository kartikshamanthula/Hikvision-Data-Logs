import express from 'express';
import cors from 'cors';
import DigestFetch from 'digest-fetch';
import { Parser } from 'xml2js';

const app = express();
app.use(cors());
app.use(express.json());


const xmlParser = new Parser({
    explicitArray: false,
    mergeAttrs: true,
    trim: true
});

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
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse as JSON:", e.message);
        return {};
    }
}


app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/attendance', async (req, res) => {
    const client = new DigestFetch(USERNAME, PASSWORD);
    const url = `${BASE_URL}/AccessControl/AcsEvent?format=json`;

    const payload = {
        "AcsEventCond": {
            "searchID": "1",
            "searchResultPosition": 0,
            "maxResults": 1000,
            "major": 0,
            "minor": 0,
            // START FROM MARCH 19, 2026
            "startTime": "2026-03-19T00:00:00",
            "endTime": "2026-03-21T23:59:59",
            "timeReverseOrder": true
        }
    };

    try {
        console.log("Fetching logs starting from 19-03-2026...");
        const response = await client.fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        const data = await parseResponse(rawText);

        if (data.statusString || data.errorMsg) {
            console.log("Device Error:", data.statusString || data.errorMsg);
        }

        // Try both common response keys
        let events = data?.AcsEventSearchOut?.InfoList || data?.AcsEvent?.InfoList || [];

        // Fix: Ensure it's an array for React
        if (events && !Array.isArray(events)) {
            events = [events];
        }

        console.log(`Successfully processed ${events.length} logs.`);
        res.json(events);

    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json([]);
    }
});
app.listen(5000, () => console.log('Backend running on http://localhost:5000'));