"use client"

import { useState, useEffect } from "react"
import './App.css'

function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
    })

    useEffect(() => {
        const targetDate = new Date("2025-08-01T19:30:00")

        const updateTimer = () => {
            const now = new Date().getTime()
            const target = targetDate.getTime()
            const difference = target - now

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((difference % (1000 * 60)) / 1000)

                setTimeLeft({ days, hours, minutes, seconds, expired: false })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="timer-card">
            <div className="timer-content">
                <div className="timer-title">
                    <span role="img" aria-label="heart">💖</span>
                    <h1>Who said you don’t get daffodils in India?</h1>
                    <span role="img" aria-label="heart">💖</span>
                </div>

                {timeLeft.expired ? (
                    <div className="expired-message">
                        <div>🎉 Time's Up! 🎉</div>
                        <div>The moment has arrived!</div>
                        <div> Make sure to look up at the sky when you go out you will see a surprise you will love !!!! </div>
                    </div>
                ) : (
                    <div className="timer-grid">
                        <div className="timer-box">
                            <div className="timer-value">{timeLeft.days}</div>
                            <div className="timer-label">Days</div>
                        </div>
                        <div className="timer-box">
                            <div className="timer-value">{timeLeft.hours}</div>
                            <div className="timer-label">Hours</div>
                        </div>
                        <div className="timer-box">
                            <div className="timer-value">{timeLeft.minutes}</div>
                            <div className="timer-label">Minutes</div>
                        </div>
                        <div className="timer-box">
                            <div className="timer-value">{timeLeft.seconds}</div>
                            <div className="timer-label">Seconds</div>
                        </div>
                    </div>
                )}

                <div className="magic-message">
                    <span role="img" aria-label="sparkles">✨</span>
                    <span>OMGGGGG IM SOOO EXCITED FOR WHATS GOING TO HAPPEN WHEN THE TIMER HITS ZERO. TRUST ME YOU WILL LOVE IT. I LOVE YOU FOREVER BARKHA!!!!!</span>
                    <span role="img" aria-label="sparkles">✨</span>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <div className="valentine-background">
            <CountdownTimer />
        </div>
    )
}