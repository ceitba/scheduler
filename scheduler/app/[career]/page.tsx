"use client";
import { redirect, useSearchParams, useParams } from 'next/navigation';
import TabView from "../components/TabView";
import CourseView from "../components/CourseView";
import SettingsView from "../components/SettingsView";
import { SchedulerPreview } from "../components/SchedulerPreview";
import TopBar from "../components/Topbar";
import CommissionModal from "../components/CommissionModal";
import { Subject } from "../hooks/useSubjects";
import { useState } from 'react';

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface PageProps {
  params: {
    career: string;
  };
}

const VALID_CAREERS = ['S'];

// Define valid plans for each career
const CAREER_PLANS = {
  'S': ['SREV-23', 'SREV-19', 'SREV-14']
} as const;

export default function CareerPage({ params }: PageProps) {
  const { career } = useParams();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Subject | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);

  // Redirect to home if career code is invalid
  if (!VALID_CAREERS.includes(career as string)) {
    redirect('/');
  }
  // If no plan is specified or plan is invalid, redirect to the default plan
  if (!plan || !CAREER_PLANS[career as keyof typeof CAREER_PLANS].includes(plan as any)) {
    redirect(`/${career}?plan=${CAREER_PLANS[career as keyof typeof CAREER_PLANS][0]}`);
  }

  const handleCommissionSelect = (commissionId: string) => {
    if (selectedCourseForModal) {
      const commission = commissionId === 'any'
        ? { id: 'any', name: 'Cualquier comisión' }
        : selectedCourseForModal.commissions.find(c => c.id === commissionId)
          || selectedCourseForModal.commissions[0];

      setSelectedCourses(prev => [
        ...prev,
        {
          ...selectedCourseForModal,
          selectedCommission: commission.id,
          isPriority: false,
        },
      ]);
    }
    setModalOpen(false);
    setSelectedCourseForModal(null);
  };

  const tabs = [
    {
      label: "Cursos",
      content: <CourseView 
        selectedCourses={selectedCourses}
        onCommissionSelect={(course) => {
          setSelectedCourseForModal(course);
          setModalOpen(true);
        }}
        onAddCourse={(course, commission) => {
          setSelectedCourses(prev => [
            ...prev,
            {
              ...course,
              selectedCommission: commission.id,
              isPriority: false,
            },
          ]);
        }}
        onRemoveCourse={(courseId) => {
          setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
        }}
      />,
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

      <CommissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleCommissionSelect}
        commission={selectedCourseForModal?.commissions || []}
        courseName={selectedCourseForModal?.name || ''}
      />
    </div>
  );
}
