import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    const status = {
      keyIdPresent: !!keyId,
      keyIdValue: keyId ? `${keyId.substring(0, 8)}...` : "missing",
      keySecretPresent: !!keySecret,
      keySecretValueLength: keySecret ? keySecret.length : 0,
      keySecretIsPlaceholder: keySecret === "YOUR_KEY_SECRET_HERE",
      razorpayInitialized: false,
      authCheck: "failed",
      errorDetail: ""
    }

    if (!keyId || !keySecret || keySecret === "YOUR_KEY_SECRET_HERE") {
      return NextResponse.json({ success: false, message: "Missing or placeholder Razorpay keys.", status })
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
      status.razorpayInitialized = true

      // Try to fetch a list of payments with limit 1 to verify credentials
      await razorpay.payments.all({ count: 1 })
      status.authCheck = "success"
    } catch (err: any) {
      status.authCheck = "failed"
      status.errorDetail = err.message || err.description || JSON.stringify(err)
    }

    return NextResponse.json({ success: status.authCheck === "success", status })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
