import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export async function POST(request: NextRequest) {
  const res = await request.json()
  const url = res.url

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN as string,
  })
  const output = await replicate.run(
    "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
    {
      input: {
        image: url,
      },
    }
  )

  return NextResponse.json(output)
}
