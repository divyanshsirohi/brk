// server.js (ESM version)
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import twilio from 'twilio'

dotenv.config({ path: new URL('./.env', import.meta.url).pathname })

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(bodyParser.json())

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

const YOUR_PHONE = process.env.YOUR_PHONE
const TWILIO_PHONE = process.env.TWILIO_PHONE

app.post('/send-sms', async (req, res) => {
    const { answer } = req.body
    let messageBody = ''

    if (answer === 'yes') {
        messageBody = "Meet me at 6.30 PM tommorow, meri jaan 💍 feel free to call okay?"
    } else if (answer === 'no') {
        messageBody = "Stop rejecting me 😤 I'm gonna propose again! :("
    } else {
        return res.status(400).json({ message: "Invalid answer" })
    }

    try {
        const result = await client.messages.create({
            body: messageBody,
            from: TWILIO_PHONE,
            to: YOUR_PHONE
        })
        console.log("Twilio message sent:", result.sid)
        res.json({ message: "Message sent!" })
    } catch (error) {
        console.error("Twilio error:", error)
        res.status(500).json({ message: "Failed to send message" })
    }
})

app.listen(3001, () => {
    console.log("Server running on port 3001")
})
