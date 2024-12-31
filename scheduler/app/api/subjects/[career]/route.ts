import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { career: string } }
) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  const { career } = params;

  try {
    // TODO: change to use the ceitba API
    // TODO: Change the way the json is structured to fit the API
    const subjects = [
      {
        id: "72.11",
        code: "72.11",
        name: "Análisis Matemático I",
        semester: 1,
        year: 1,
        commissions: [
          {
            id: "a",
            name: "Comisión A",
            schedule: "Lun y Mie 18:00-22:00", 
          },
          {
            id: "b",
            name: "Comisión B",
            schedule: "Mar y Jue 18:00-22:00",
          },
        ],
      },
      // Add more subjects as needed
    ];

    return NextResponse.json({ subjects });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
} 