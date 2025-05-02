"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export default function PortfolioChart({ data }) {
  const chartRef = useRef(null)
  const legendRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !legendRef.current || !data.length) return

    // Clear previous chart and legend
    d3.select(chartRef.current).selectAll("*").remove()
    d3.select(legendRef.current).selectAll("*").remove()

    const totalNetWorth = data.reduce((sum, item) => sum + item.netWorth, 0)

    const chartData = data.map((item) => ({
      name: item.blockchain,
      value: item.netWorth,
      percentage: ((item.netWorth / totalNetWorth) * 100).toFixed(2),
    }))

    const width = 300
    const height = 300
    const radius = Math.min(width, height) / 2

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)
    const pie = d3.pie().value((d) => d.value)
    const dataReady = pie(chartData)
    const arc = d3.arc().innerRadius(0).outerRadius(radius)

    const legend = d3.select(legendRef.current)
    const legendItems = {}

    dataReady.forEach((d) => {
      const legendItem = legend.append("div").attr("class", "flex items-center m-2 transition-transform")

      legendItem
        .append("div")
        .attr("class", "w-5 h-5 mr-2 rounded")
        .style("background-color", color(d.data.name))

      legendItem
        .append("span")
        .text(`${d.data.name} - $${formatNumber(d.data.value)} (${d.data.percentage}%)`)

      legendItems[d.data.name] = legendItem.node()
    })

    svg
      .selectAll("path")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "#000000")
      .style("stroke-width", "0.5px")
      .style("opacity", 0.8)
      .on("mouseover", function (event, d) {
        const lightenedColor = d3.color(color(d.data.name))?.brighter(0.5)
        d3.select(this).attr("fill", lightenedColor?.toString() || "")

        const legendItem = legendItems[d.data.name]
        if (legendItem) {
          const colorDiv = legendItem.querySelector("div")
          if (colorDiv) colorDiv.style.backgroundColor = lightenedColor?.toString() || ""
          legendItem.style.transform = "scale(1.1)"
        }
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", color(d.data.name))

        const legendItem = legendItems[d.data.name]
        if (legendItem) {
          const colorDiv = legendItem.querySelector("div")
          if (colorDiv) colorDiv.style.backgroundColor = color(d.data.name)
          legendItem.style.transform = "scale(1)"
        }
      })

    function formatNumber(num) {
      if (isNaN(num) || num === null || num === undefined) return "0.00"
      if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B"
      if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M"
      if (num >= 1.0e3) return (num / 1.0e3).toFixed(2) + "K"
      return num.toFixed(2)
    }
  }, [data])

  return (
    <div className="flex flex-col items-center">
      <div ref={chartRef} className="w-full max-w-md"></div>
      <div ref={legendRef} className="flex flex-wrap justify-center mt-8"></div>
    </div>
  )
}
