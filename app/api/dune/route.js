// app/api/dune/route.js

import { NextResponse } from "next/server"

export async function POST(req) {
  const { ethAddress } = await req.json()
  const apiKey = process.env.DUNE_API_KEY

  try {
    // Step 1: Execute the query
    const response = await fetch("https://api.dune.com/api/v1/query/4617489/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dune-api-key": apiKey,
      },
      body: JSON.stringify({
        query_parameters: { eth_address: ethAddress },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json()
      console.error("Error from Dune API:", errorBody)
      return NextResponse.json({ error: "Execution failed", details: errorBody }, { status: 500 })
    }

    const postData = await response.json()
    const executionId = postData.execution_id

    // Step 2: Poll for results
    let isFinished = false
    let resultData = null

    while (!isFinished) {
      const resultResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-dune-api-key": apiKey,
        },
      })

      if (!resultResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch result data" }, { status: 500 })
      }

      const resultDataResponse = await resultResponse.json()

      if (resultDataResponse.is_execution_finished) {
        isFinished = true
        resultData = resultDataResponse.result.rows
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({ rows: resultData }, { status: 200 })
  } catch (err) {
    console.error("Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
