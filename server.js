require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// === [1] Voice Call Flow Entry Point ===
app.post('/voice', (req, res) => {
    const response = new VoiceResponse();
    const gather = response.gather({
        input: 'dtmf',
        numDigits: 1,
        action: '/handle-key'
    });

    gather.say("Hi! This is a test interview call. " +
               "Press 1 for 10 A M, 2 for 2 P M, or 3 for 6 P M.");

    response.redirect('/voice'); // Repeat if no input

    res.type('text/xml');
    res.send(response.toString());
});
app.get('/voice', (req, res) => {
    const response = new VoiceResponse();
    const gather = response.gather({
        input: 'dtmf',
        numDigits: 1,
        action: '/handle-key'
    });

    gather.say("Hi! This is a test interview call. " +
               "Press 1 for 10 A M, 2 for 2 P M, or 3 for 6 P M.");

    response.redirect('/voice');

    res.type('text/xml');
    res.send(response.toString());
});

// === [2] DTMF Key Handler ===
app.post('/handle-key', (req, res) => {
    const digit = req.body.Digits;
    const response = new VoiceResponse();
    const slotMap = {
        '1': '10 A M',
        '2': '2 P M',
        '3': '6 P M'
    };

    if (slotMap[digit]) {
        response.say(`Thanks! You selected ${slotMap[digit]}. We will confirm your interview.`);
    } else {
        response.say("Invalid input. Please try again.");
        response.redirect('/voice');
    }

    res.type('text/xml');
    res.send(response.toString());
});

// === [3] Trigger Call (GET) ===
app.get('/make-call', async (req, res) => {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const call = await client.calls.create({
            to: process.env.MY_PHONE_NUMBER,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: `${process.env.PUBLIC_URL}/voice`
        });

        res.send(`📞 Call initiated. SID: ${call.sid}`);
    } catch (error) {
        console.error('Call failed:', error);
        res.status(500).send('❌ Failed to make call');
    }
});

// === [4] Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
