"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import * as d3 from "d3"

export default function PortfolioVisualize() {
  const [portfolioData, setPortfolioData] = useState([])
  const [totalNetWorth, setTotalNetWorth] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("portfolioData")

    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setPortfolioData(parsedData)

      const total = parsedData.reduce((sum, item) => sum + item.netWorth, 0)
      setTotalNetWorth(total)

      setTimeout(() => {
        renderPortfolioVisualization(parsedData)
      }, 100)
    } else {
      alert("No portfolio data found. Please fetch your portfolio first.")
      router.push("/portfolio")
    }
  }, [router])

  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "0.00"
    if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B"
    if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M"
    if (num >= 1.0e3) return (num / 1.0e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  const renderPortfolioVisualization = (portfolioData) => {
    document.getElementById('chart').innerHTML = ''
    document.getElementById('legend').innerHTML = ''

    const totalNetWorth = portfolioData.reduce((sum, item) => sum + item.netWorth, 0)
    const data = portfolioData.map((item) => ({
      name: item.blockchain,
      value: item.netWorth,
      percentage: ((item.netWorth / totalNetWorth) * 100).toFixed(2),
    }))

    const width = 300, height = 300, radius = Math.min(width, height) / 2

    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)
    const pie = d3.pie().value((d) => d.value)
    const dataReady = pie(data)
    const arc = d3.arc().innerRadius(0).outerRadius(radius)

    const legend = d3.select('#legend')
    const legendItems = {}

    dataReady.forEach((d) => {
      const legendItem = legend.append('div').attr('class', 'legend-item')
      legendItem
        .append('div')
        .attr('class', 'legend-color')
        .style('background-color', color(d.data.name))
      legendItem.append('span').text(
        `${d.data.name} - $${formatNumber(d.data.value)} (${d.data.percentage}%)`
      )
      legendItems[d.data.name] = legendItem.node()
    })

    svg.selectAll('path')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.name))
      .attr('stroke', '#000000')
      .style('stroke-width', '0.5px')
      .style('opacity', 0.8)
      .on('mouseover', function (event, d) {
        const lightenedColor = d3.color(color(d.data.name)).brighter(0.5)
        d3.select(this).attr('fill', lightenedColor)
        const legendItem = legendItems[d.data.name]
        if (legendItem) {
          legendItem.querySelector('.legend-color').style.backgroundColor = lightenedColor
          legendItem.style.transform = 'scale(1.1)'
        }
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', color(d.data.name))
        const legendItem = legendItems[d.data.name]
        if (legendItem) {
          legendItem.querySelector('.legend-color').style.backgroundColor = color(d.data.name)
          legendItem.style.transform = 'scale(1)'
        }
      })
  }

  return (
    <>
      <Navbar />
      <header>
        <h1>Portfolio Visualization</h1>
      </header>
      <div id="chart"></div>
      <div id="legend"></div>
    </>
  )
}
