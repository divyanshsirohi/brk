import { useState } from 'react'
import axios from 'axios'
import './App.css'

export default function ProposalComponent() {
  const [response, setResponse] = useState("")

  const handleAnswer = async (answer: 'yes' | 'no') => {
    try {
      const res = await axios.post('http://localhost:3001/send-sms', { answer })
      setResponse(res.data.message)
    } catch (err) {
        console.error(err)
        setResponse("Something went wrong.")
    }

  }

  return (
      <>
          <div className="main-text">
            <h1>Will you be mine? 💖</h1>
              <h2>Lets meet at 6.30 tommorow?</h2>
            <button onClick={() => handleAnswer('yes')}>Yes</button>
            <button onClick={() => handleAnswer('no')}>No</button>
            <p>{response}</p>
          </div>
      </>
  )
}
