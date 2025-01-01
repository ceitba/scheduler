import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  year: number;
  commissions: {
    id: string;
    name: string;
    schedule?: string;
  }[];
}

interface SubjectsResponse {
  subjects: Subject[];
  error?: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { career } = useParams();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/subjects/${career}?plan=${plan}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data: SubjectsResponse = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setSubjects(data.subjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (career && plan) {
      fetchSubjects();
    }
  }, [career, plan]);

  return { subjects, loading, error };
} 