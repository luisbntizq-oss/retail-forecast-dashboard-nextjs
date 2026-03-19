import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('>>> PAYLOAD RECEIVED IN PROXY BATCH:', JSON.stringify(body, null, 2));

    const backendUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const res = await fetch(`${backendUrl}/api/v1/predict/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch {
        parsedError = { detail: errorData || `HTTP Error: ${res.status}` };
      }
      return NextResponse.json(parsedError, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error('Error in batch predict proxy:', error);
    return NextResponse.json(
      { detail: 'Internal Server Error forwarding batch request to prediction API' },
      { status: 500 }
    );
  }
}
