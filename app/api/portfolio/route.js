// app/api/portfolio/route.js

import { NextResponse } from "next/server"

export async function POST(req) {
  const { ethAddress } = await req.json()
  const apiKey = process.env.COINSTATS_API_KEY

  try {
    const apiUrl = `https://openapiv1.coinstats.app/wallet/balances?address=${ethAddress}&networks=all`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
