// app/api/nft-holdings/route.js

import { NextResponse } from "next/server"

export async function POST(req) {
  const { ethAddress } = await req.json()
  const apiKey = process.env.COINSTATS_API_KEY

  try {
    const url = `https://openapiv1.coinstats.app/nft/wallet/${ethAddress}/assets?page=15&limit=100`

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        accept: "application/json",
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("NFT API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
