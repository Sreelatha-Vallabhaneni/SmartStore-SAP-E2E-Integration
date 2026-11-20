import { NextResponse } from "next/server";

export async function POST(request) {
  const { order, customUrl, customKey } = await request.json();

  // it takes key values from UI(URL/Key) Settings or .env.local
  const sapEndpoint = customUrl || process.env.SAP_API_PROXY_URL;
  const apiKey = customKey || process.env.SAP_API_KEY;

  // 1. if there is no Live SAP URL, run in Local Simulation Mode
  if (!sapEndpoint) {
    const postalCode = order?.customer?.postalCode || "";

    // Simulate Groovy Postal Code Validation (4 digits check)
    if (!/^\d{4}$/.test(postalCode)) {
      return NextResponse.json(
        {
          orderId: order.orderId,
          status: "ERROR",
          source: "Local Mock (Simulating SAP Groovy Script)",
          message: `Exception Subprocess HTTP 400: Danish postal code '${postalCode}' must contain exactly 4 digits.`,
        },
        {
          status: 400,
          headers: { "X-Order-Priority": order.priority },
        }
      );
    }

    return NextResponse.json(
      {
        orderId: order.orderId,
        status: "SUCCESS",
        source: "Local Mock Mode (Ready for SAP CPI URL)",
        routingPriority: order.priority === "HIGH" ? "HIGH_PRIORITY_QUEUE" : "STANDARD_QUEUE",
        message: "Sales order successfully created in S/4HANA (Simulated).",
      },
      {
        status: 200,
        headers: { "X-Order-Priority": order.priority },
      }
    );
  }

  // 2. Real SAP Integration Suite Call (without CORS issues)
  try {
    const response = await fetch(sapEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        APIKey: apiKey || "",
      },
      body: JSON.stringify(order),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { rawResponse: rawText };
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "X-Order-Priority": response.headers.get("X-Order-Priority") || order.priority,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "SAP proxy could not be reached: " + error.message,
      },
      { status: 500 }
    );
  }
}
