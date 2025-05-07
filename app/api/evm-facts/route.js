// app/api/evm-facts/route.js

import { NextResponse } from "next/server"

export async function POST(req) {
  const { ethAddress } = await req.json()
  const apiKey = process.env.EVM_FACTS_API_KEY

  try {
    const executionRes = await fetch("https://api.dune.com/api/v1/query/4528879/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dune-api-key": apiKey,
      },
      body: JSON.stringify({ query_parameters: { address: ethAddress } }),
    })

    if (!executionRes.ok) {
      const err = await executionRes.text()
      return NextResponse.json({ error: "Execution failed", details: err }, { status: 500 })
    }

    const { execution_id } = await executionRes.json()

    // Polling for results
    let isFinished = false
    let resultData = null

    while (!isFinished) {
      const resultRes = await fetch(`https://api.dune.com/api/v1/execution/${execution_id}/results`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-dune-api-key": apiKey,
        },
      })

      if (!resultRes.ok) {
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
      }

      const resultDataResponse = await resultRes.json()

      if (resultDataResponse.is_execution_finished) {
        isFinished = true
        resultData = resultDataResponse.result.rows
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({ data: resultData }, { status: 200 })
  } catch (err) {
    console.error("Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
