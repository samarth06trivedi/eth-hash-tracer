"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"

export default function NFTHoldings() {
  const [ethAddress, setEthAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [nftProjects, setNftProjects] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalValue, setTotalValue] = useState(0)
  const [showTotalValue, setShowTotalValue] = useState(false)
  const [showPagination, setShowPagination] = useState(false)
  const itemsPerPage = 10

  const fetchNFTData = async () => {
    if (!ethAddress) {
      alert("Please enter a valid Ethereum address.")
      return
    }
  
    setLoading(true)
    setNftProjects([])
    setTotalValue(0)
    setShowTotalValue(false)
    setShowPagination(false)
  
    try {
      const response = await fetch("/api/nft-holdings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ethAddress }),
      })
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
  
      const { data } = await response.json()
      setLoading(false)
  
      if (data.data && data.data.length > 0) {
        const sortedProjects = [...data.data].sort((a, b) => b.floorPrice - a.floorPrice)
        setNftProjects(sortedProjects)
  
        const total = sortedProjects.reduce((sum, project) => {
          return sum + project.floorPrice * project.assetsCount
        }, 0)
  
        setTotalValue(total)
        setShowTotalValue(true)
        setShowPagination(true)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Error fetching NFT data:", error)
      setLoading(false)
      alert("Failed to load NFT data.")
    }
  }
  

  const displayNFTPage = (page) => {
    const nftDisplay = document.getElementById("nftDisplay")
    if (!nftDisplay) return

    nftDisplay.innerHTML = ""

    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = nftProjects.slice(startIndex, endIndex)

    currentItems.forEach((project) => {
      project.assets.forEach((asset) => {
        const nftItem = document.createElement("div")
        nftItem.className = "nft-item"

        // Truncate NFT name if it exceeds 20 characters
        const truncatedName = asset.name.length > 20 ? `${asset.name.slice(0, 16)}...` : asset.name

        nftItem.innerHTML = `
          <img src="${asset.previewImg}" alt="${truncatedName}" style="width: 100%; border-radius: 8px;" />
          <h3>${truncatedName}</h3>
          <p>Price: ${project.floorPrice} ETH</p>
        `
        nftDisplay.appendChild(nftItem)
      })
    })

    updatePagination()
  }

  const updatePagination = () => {
    const totalPages = Math.ceil(nftProjects.length / itemsPerPage)

    document.getElementById("prevPageButton").disabled = currentPage === 1
    document.getElementById("nextPageButton").disabled = currentPage === totalPages
    document.getElementById("firstPageButton").disabled = currentPage === 1
    document.getElementById("lastPageButton").disabled = currentPage === totalPages

    document.getElementById("currentPage").textContent = `Page ${currentPage}`
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    if (nftProjects.length > 0) {
      displayNFTPage(currentPage)
    }
  }, [currentPage, nftProjects])

  return (
    <>
      <Navbar />
      <div className="container">
        <header>
          <h1>NFT Holdings</h1>
          <p>Enter an Ethereum address to see all its NFTs and their total value in Ether.</p>
        </header>

        <div className="input-container">
          <input
            type="text"
            id="ethAddressInput"
            placeholder="Enter an Ethereum Address"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
          />
          <button id="fetchNFTsButton" onClick={fetchNFTData}>
            Get NFTs
          </button>
        </div>

        {loading && (
          <div id="loadingIndicator" style={{ display: "block" }}>
            Loading...
          </div>
        )}

        {showTotalValue && (
          <div id="totalValue" style={{ display: "block" }}>
            Your NFT Collection Worth: {totalValue.toFixed(2)} ETH
          </div>
        )}

        <div id="nftDisplay" className="grid"></div>

        {showPagination && (
          <div id="pagination" style={{ display: "flex" }}>
            <button id="firstPageButton" onClick={() => handlePageChange(1)}>
              First
            </button>
            <button id="prevPageButton" onClick={() => handlePageChange(currentPage - 1)}>
              Previous
            </button>
            <span id="currentPage">Page {currentPage}</span>
            <button id="nextPageButton" onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </button>
            <button id="lastPageButton" onClick={() => handlePageChange(Math.ceil(nftProjects.length / itemsPerPage))}>
              Last
            </button>
          </div>
        )}
      </div>
    </>
  )
}
