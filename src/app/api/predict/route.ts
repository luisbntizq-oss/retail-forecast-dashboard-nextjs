import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const backendUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    
    // Copy headers from request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const res = await fetch(`${backendUrl}/predict`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Forward the error response as closely as possible
      const errorData = await res.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch (e) {
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
      statusText: res.statusText,
    });
  } catch (error) {
    console.error('Error in predict proxy API:', error);
    return NextResponse.json(
      { detail: 'Internal Server Error forwarding request to prediction API' },
      { status: 500 }
    );
  }
}
