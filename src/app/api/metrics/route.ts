import { type NextRequest, NextResponse } from "next/server"
import { metricsCollector } from "@/lib/metrics"
import { asyncWrapper } from "@/lib/middleware/asyncWrapper"
import type { RequestContext } from "@/lib/middleware/types"

async function GET(request: NextRequest, ctx: RequestContext) {
  return NextResponse.json(metricsCollector.getMetrics())
}

export default asyncWrapper(GET)
