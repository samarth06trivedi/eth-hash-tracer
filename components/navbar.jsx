"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const address = accounts[0]
        setIsWalletConnected(true)
        alert(`Wallet Connected: ${address}`)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        alert("Error connecting wallet. Please try again.")
      }
    } else {
      alert("MetaMask not found. Install it from https://metamask.io and try again.")
    }
  }

  return (
    <nav>
      <div className="nav-container">
        <Link href="/" className="logo">
          HASH TRACER
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li className="dropdown">
            <a href="#" className="dropbtn">
              Services ▼
            </a>
            <div className="dropdown-content">
              <Link href="/evm-facts">EVM Facts</Link>
              <Link href="/nft-holdings">NFT Holdings</Link>
              <Link href="/portfolio">Portfolio Tracker</Link>
            </div>
          </li>
          <li>
            <button id="connectWalletButton" onClick={connectWallet} style={{ visibility: "visible" }}>
              {isWalletConnected ? "Connected" : "Connect Wallet"}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
