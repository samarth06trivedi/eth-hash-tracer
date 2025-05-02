"use client"

import { useRef, useState } from "react"
import Navbar from "@/components/navbar"
import * as d3 from "d3"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [ethAddress, setEthAddress] = useState("")
  const graphRef = useRef(null)

  const fetchDuneData = async (address) => {
    try {
      setLoading(true)

      const response = await fetch("https://api.dune.com/api/v1/query/4617489/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dune-api-key": "4TS6eluto3kXBz3rJMMEyhbl0vRONnQ5",
        },
        body: JSON.stringify({
          query_parameters: { eth_address: address },
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json()
        console.error("Error from Dune API:", errorBody)
        throw new Error("Failed to fetch data from Dune")
      }

      const postData = await response.json()
      const executionId = postData.execution_id
      let isFinished = false
      let resultData = null

      while (!isFinished) {
        const resultResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-dune-api-key": "4TS6eluto3kXBz3rJMMEyhbl0vRONnQ5",
          },
        })

        if (!resultResponse.ok) {
          throw new Error("Failed to fetch results from Dune")
        }

        const resultDataResponse = await resultResponse.json()
        console.log("Dune API GET Result:", resultDataResponse)

        if (resultDataResponse.is_execution_finished) {
          isFinished = true
          resultData = resultDataResponse.result.rows
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      const rows = resultData
      const nodes = []
      const links = []
      const addressSet = new Set()

      if (!addressSet.has(ethAddress)) {
        nodes.unshift({ id: ethAddress, interaction_frequency: "N/A" })
        addressSet.add(ethAddress)
      }

      rows.forEach((row) => {
        const { address, interaction_frequency } = row

        if (!addressSet.has(address)) {
          nodes.push({ id: address, interaction_frequency })
          addressSet.add(address)
        }

        links.push({
          source: address,
          target: ethAddress,
          value: interaction_frequency,
        })
      })

      drawGraph({ nodes, links })

      if (graphRef.current) {
        graphRef.current.style.border = "1px solid #ddd"
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateGraph = () => {
    if (ethAddress) {
      if (graphRef.current) {
        d3.select(graphRef.current).selectAll("*").remove()
      }
      fetchDuneData(ethAddress)
    } else {
      alert("Please enter a valid Ethereum address.")
    }
  }

  const drawGraph = (data) => {
    if (!graphRef.current) return

    const graphDiv = graphRef.current
    const width = graphDiv.clientWidth
    const height = graphDiv.clientHeight || 550

    const svg = d3.select(graphDiv).append("svg").attr("width", width).attr("height", height)

    const zoomGroup = svg.append("g")

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))

    const link = zoomGroup
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value))
      .attr("stroke", "#aaa")

    const node = zoomGroup
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.id === ethAddress ? 15 : 10))
      .attr("fill", (d) => (d.id === ethAddress ? "#ff6b6b" : "#4CAF50"))
      .call(drag(simulation))

    const label = zoomGroup
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .attr("dy", ".35em")
      .attr("dx", 15)

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)

      label.attr("x", (d) => d.x).attr("y", (d) => d.y)
    })

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          zoomGroup.attr("transform", event.transform)
        }),
    )

    function drag(simulation) {
      return d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <header>
          <h1>Ethereum Transaction Explorer</h1>
          <p>Visualize transactions as an interactive graph.</p>
        </header>
        <div className="input-container">
          <input
            type="text"
            id="ethAddressInput"
            placeholder="Enter Ethereum Address"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
          />
          <button id="fetch_facts_button" onClick={updateGraph}>
            Search
          </button>
        </div>
        {loading && (
          <div id="loading" style={{ display: "block", textAlign: "center" }}>
            Loading...
          </div>
        )}
        <div id="graph" ref={graphRef} style={{ height: "550px" }}></div>
      </div>
    </>
  )
}
