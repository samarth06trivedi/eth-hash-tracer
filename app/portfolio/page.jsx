"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"

export default function Portfolio() {
  const [ethAddress, setEthAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [showNetWorth, setShowNetWorth] = useState(false)
  const [showVisualizeButton, setShowVisualizeButton] = useState(false)
  const [filteredBlockchains, setFilteredBlockchains] = useState([])
  const [totalNetWorth, setTotalNetWorth] = useState(0)
  const router = useRouter()

  const fetchPortfolioData = async () => {
    if (!ethAddress) {
      alert("Please enter a valid Ethereum address.")
      return
    }

    setLoading(true)
    setShowNetWorth(false)
    setShowVisualizeButton(false)

    const blockchainBreakdown = document.getElementById("blockchainBreakdown")
    if (blockchainBreakdown) {
      blockchainBreakdown.innerHTML = ""
    }

    try {
      const apiUrl = `https://openapiv1.coinstats.app/wallet/balances?address=${ethAddress}&networks=all`
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-API-KEY": "zv8R+W/5jzIXxS4CFWfYSfBDasMjEMxw+00Su0RMhEE=",
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      setLoading(false)

      if (data.length > 0) {
        let totalNetWorth = 0
        const blockchains = []

        // Loop through each blockchain
        data.forEach((blockchain) => {
          let blockchainNetWorth = 0

          // Loop through each token on the blockchain
          blockchain.balances.forEach((balance) => {
            const tokenAmount = balance.amount
            const tokenPrice = balance.price

            // Calculate the value of each token and add to blockchain's net worth
            blockchainNetWorth += tokenAmount * tokenPrice
          })

          // Only add blockchain to the list if worth >= $1
          if (blockchainNetWorth >= 1) {
            blockchains.push({
              blockchain: blockchain.blockchain,
              netWorth: blockchainNetWorth,
              balances: blockchain.balances,
            })
            totalNetWorth += blockchainNetWorth
          }
        })

        // Sort blockchains by net worth in descending order
        blockchains.sort((a, b) => b.netWorth - a.netWorth)

        setFilteredBlockchains(blockchains)
        setTotalNetWorth(totalNetWorth)
        setShowNetWorth(true)
        setShowVisualizeButton(true)

        // Display the blockchain breakdown list
        displayBlockchainBreakdown(blockchains)

        // Save to localStorage for visualization
        localStorage.setItem("portfolioData", JSON.stringify(blockchains))
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
      setLoading(false)
    }
  }

  const displayBlockchainBreakdown = (blockchains) => {
    const blockchainBreakdown = document.getElementById("blockchainBreakdown")
    if (!blockchainBreakdown) return

    blockchainBreakdown.innerHTML = ""

    // Loop through each blockchain
    blockchains.forEach((blockchain) => {
      const blockchainItem = document.createElement("div")
      blockchainItem.className = "blockchain-item"
      blockchainItem.innerHTML = `
        <h3 class="blockchain-title" onclick="toggleBlockchainDetails('${blockchain.blockchain}')">
          ${blockchain.blockchain} - $${formatNumber(blockchain.netWorth)}
        </h3>
        <div id="${blockchain.blockchain}" class="blockchain-details" style="display:none;">
          <p>Click to view the tokens in this blockchain</p>
          <div id="${blockchain.blockchain}-tokens" style="display:none;"></div>
        </div>
      `
      blockchainBreakdown.appendChild(blockchainItem)
    })

    // Add the toggle function to window so it can be called from onclick
    window.toggleBlockchainDetails = (blockchainName) => {
      const blockchainDetailsDiv = document.getElementById(blockchainName)

      if (blockchainDetailsDiv.style.display === "none") {
        // Find the blockchain data
        const blockchainData = blockchains.find((b) => b.blockchain === blockchainName)

        if (blockchainData) {
          // Sort the balances by descending value (amount * price)
          const sortedBalances = blockchainData.balances.sort((a, b) => b.amount * b.price - a.amount * a.price)

          // Generate HTML content for the sorted tokens
          const tokenDetails = sortedBalances
            .map((balance) => {
              const amount = Number.parseFloat(balance.amount) || 0
              const price = Number.parseFloat(balance.price) || 0
              return `
              <p>
                <strong>${balance.symbol}</strong>: 
                <strong>${formatNumber(amount)}</strong>, 
                Value: <strong>$${formatNumber(amount * price)}</strong>
              </p>`
            })
            .join("")

          // Set the inner HTML with the token details
          blockchainDetailsDiv.innerHTML = tokenDetails
        }

        // Show the blockchain details
        blockchainDetailsDiv.style.display = "block"
      } else {
        // Hide the blockchain details
        blockchainDetailsDiv.style.display = "none"
      }
    }
  }

  const redirectToVisualization = () => {
    if (filteredBlockchains.length > 0) {
      // Save the portfolio data in localStorage
      localStorage.setItem("portfolioData", JSON.stringify(filteredBlockchains))

      // Set flag in sessionStorage to indicate return from visualize
      sessionStorage.setItem("returningFromVisualize", "true")

      // Redirect to the visualization page
      router.push("/portfolio/visualize")
    } else {
      alert("No portfolio data available to visualize.")
    }
  }

  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) {
      return "0.00" // Fallback for invalid numbers
    }
    num = Number.parseFloat(num) // Ensure num is a valid float
    if (num >= 1.0e9) {
      return (num / 1.0e9).toFixed(2) + "B"
    } else if (num >= 1.0e6) {
      return (num / 1.0e6).toFixed(2) + "M"
    } else if (num >= 1.0e3) {
      return (num / 1.0e3).toFixed(2) + "K"
    } else {
      if (num < 0.1) {
        return num.toFixed(7)
      }
      return num.toFixed(2)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <header>
          <h1 id="port">Portfolio Tracker</h1>
          <p>Enter an Ethereum address to view your net worth across blockchains.</p>
        </header>

        <div className="input-container">
          <input
            type="text"
            id="ethAddressInput"
            placeholder="Enter an Ethereum Address"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
          />
          <button id="get_portfolio_button" onClick={fetchPortfolioData}>
            Get Portfolio
          </button>
        </div>

        {loading && (
          <p id="loadingIndicator" style={{ display: "block" }}>
            Loading data...
          </p>
        )}

        {showNetWorth && (
          <p id="netWorthDisplay" style={{ display: "block" }}>
            Total Net Worth: ${formatNumber(totalNetWorth)}
          </p>
        )}

        <div id="blockchainBreakdown"></div>

        {showVisualizeButton && (
          <div id="visualizeButtonContainer">
            <button id="visualizeButton" style={{ display: "block" }} onClick={redirectToVisualization}>
              Visualize Portfolio
            </button>
          </div>
        )}
      </div>
    </>
  )
}
