"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"

export default function EVMFacts() {
  const [ethAddress, setEthAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFacts, setShowFacts] = useState(false)
  const [facts, setFacts] = useState(null)

  const fetchAddressFacts = async () => {
    if (!ethAddress || !/^0x[a-fA-F0-9]{40}$/.test(ethAddress)) {
      alert("Please enter a valid Ethereum address.")
      return
    }
  
    setLoading(true)
    setShowFacts(false)
  
    try {
      const response = await fetch("/api/evm-facts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ethAddress }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from backend")
      }
  
      const { data } = await response.json()
  
      setLoading(false)
  
      if (data && data.length > 0) {
        setFacts(data[0])
        setShowFacts(true)
        displayFactsLetterByLetter(data[0])
      } else {
        alert("No data found for this Ethereum address.")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
      alert("Error fetching data. Please try again.")
    }
  }
  

  const formatToIST = (timestamp) => {
    const date = new Date(timestamp)
    date.setHours(date.getHours() + 5)
    date.setMinutes(date.getMinutes() + 30)
    return date.toLocaleDateString("en-GB")
  }

  const displayFactsLetterByLetter = (facts) => {
    const factsList = document.getElementById("factsList")
    const factsDisplay = document.getElementById("factsDisplay")

    if (!factsList || !factsDisplay) return

    factsList.innerHTML = ""

    const title = document.createElement("h2")
    title.textContent = "Interesting Facts About Your EVM Address"
    factsList.appendChild(title)

    const factsArray = [
      { label: "Blockchains used", value: facts.blockchains.join(", ") },
      { label: "First blockchain funded", value: facts.first_funded_blockchain },
      { label: "Funded by", value: facts.first_funded_by },
      { label: "Funding Date", value: formatToIST(facts.first_tx_block_time) },
      { label: "First transaction Date", value: formatToIST(facts.first_transfer_block_time) },
      { label: "Most used blockchain", value: facts.max_nonce_blockchain },
      { label: "Total on-chain transactions", value: facts.executed_tx_count },
      { label: "Total volume", value: `$ ${facts.received_volume_usd.toFixed(2)}` },
      { label: "Last on-chain activity", value: formatToIST(facts.last_tx_block_time) },
    ]

    let totalDelay = 0
    const totalFacts = factsArray.length
    let completedFacts = 0

    factsArray.forEach((fact, index) => {
      const fullText = `<span class="title">${fact.label}:</span> <span class="value">${fact.value}</span>`
      const animationTimePerLetter = 10
      const factAnimationTime = fullText.length * animationTimePerLetter

      setTimeout(() => {
        const factItem = document.createElement("div")
        factItem.classList.add("fact")
        factsList.appendChild(factItem)

        let currentText = ""
        let i = 0

        // Add the letter-by-letter animation
        const interval = setInterval(() => {
          currentText += fullText[i]
          factItem.innerHTML = currentText
          i++

          // Once the text is fully printed, add the border
          if (i === fullText.length) {
            factItem.style.border = "0.35px solid #ddd" // Add the border after the text is finished
            clearInterval(interval)
            completedFacts++

            // When all facts are done, add the border to the entire #factsDisplay
            if (completedFacts === totalFacts) {
              setTimeout(() => {
                factsDisplay.style.border = "1px solid #ddd" // Add border to facts display container
              }, 1000)
            }
          }
        }, animationTimePerLetter)
      }, totalDelay)

      totalDelay += factAnimationTime + 500 // Delay before starting next fact's animation
    })
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <header>
          <h1>EVM Address Report</h1>
          <p>Get An Amazing Report About EVM addresses.</p>
        </header>

        <div className="input-container">
          <input
            type="text"
            id="ethAddressInput"
            placeholder="Enter an Ethereum Address"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
          />
          <button id="fetch_facts_button" onClick={fetchAddressFacts}>
            Get Report
          </button>
        </div>

        {loading && (
          <div id="loadingIndicator" style={{ display: "block" }}>
            Loading...
          </div>
        )}

        <div id="factsDisplay" style={{ display: showFacts ? "block" : "none" }}>
          <div id="factsList"></div>
        </div>
      </div>
    </>
  )
}
