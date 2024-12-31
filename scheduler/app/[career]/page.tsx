"use client";
import { redirect, useSearchParams, useParams } from 'next/navigation';
import TabView from "../components/TabView";
import CourseView from "../components/CourseView";
import SettingsView from "../components/SettingsView";
import SchedulerPreview from "../components/SchedulerPreview";
import TopBar from "../components/Topbar";

const VALID_CAREERS = ['S'];

// Define valid plans for each career
const CAREER_PLANS = {
  'S': ['SREV-23', 'SREV-19', 'SREV-14']
} as const;

interface PageProps {
  params: {
    career: string;
  };
}

export default function CareerPage({ params }: PageProps) {
  const { career } = useParams();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  // Redirect to home if career code is invalid
  if (!VALID_CAREERS.includes(career as string)) {
    redirect('/');
  }
  // If no plan is specified or plan is invalid, redirect to the default plan
  if (!plan || !CAREER_PLANS[career as keyof typeof CAREER_PLANS].includes(plan as any)) {
    redirect(`/${career}?plan=${CAREER_PLANS[career as keyof typeof CAREER_PLANS][0]}`);
  }

  const tabs = [
    {
      label: "Cursos",
      content: <CourseView />,
    },
    {
      label: "Opciones",
      content: <SettingsView />,
    },
    {
      label: "Calendario",
      content: <SchedulerPreview />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar currentPlan={plan} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabView tabs={tabs} />
      </div>
    </div>
  );
} 