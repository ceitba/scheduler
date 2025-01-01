import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { career: string } }
) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  const career = params.career;

  try {
    // TODO: change to use the ceitba API
    const subjects = [
      {
        id: "72.11",
        code: "72.11",
        name: "Análisis Matemático I",
        semester: 1,
        year: 1,
        credits: 6,
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
      {
        id: "93.75",
        code: "93.75",
        name: "Taller de Programación III",
        semester: 2,
        year: 4,
        credits: 6,
        commissions: [
          {
            id: "a",
            name: "Comisión A",
            schedule: "Lun y Mie 14:00-18:00",
          },
          {
            id: "b",
            name: "Comisión B",
            schedule: "Mar y Jue 14:00-18:00",
          },
        ],
      },
      // Add more subjects as needed
    ];

    return Response.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return Response.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
} 