import { NextRequest } from 'next/server';
import config from '@/app/config';

export async function GET(
  request: NextRequest,
) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');

  try {
    const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.subjects}?plan=${plan}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener los horarios');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error al obtener los horarios:', error);
    return Response.json(
      { error: 'Error al obtener los horarios' },
      { status: 500 }
    );
  }
} 