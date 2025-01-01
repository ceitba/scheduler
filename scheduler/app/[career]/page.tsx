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
import { normalizePlanId, denormalizePlanId } from '../utils/planUtils';

interface SelectedCourse extends Subject {
  selectedCommission: string;
  isPriority: boolean;
}

interface PageProps {
  params: {
    career: string;
  };
}

const VALID_CAREERS = ['BIO', 'C', 'E', 'I', 'K', 'L', 'LAES', 'LN', 'M', 'N', 'P', 'Q', 'S', 'X'];

// Define valid plans for each career
const CAREER_PLANS: Record<string, string[]> = {
  'BIO': ['BIO 22', 'Bio-13'],
  'C': ['C23'],
  'E': ['E 11', 'E 11A'],
  'I': ['I22', 'I-13', 'I-13T'],
  'K': ['K22', 'K07-Rev.18', 'K07A-Rev.18'],
  'L': ['L09', 'L09-REV13', 'L09T'],
  'LAES': ['A17', 'A22'],
  'LN': ['L20'],
  'M': ['M22', 'M09-Rev18 (Marzo)', 'M09-Rev18 (Agosto)'],
  'N': ['N22', 'N18 Marzo', 'N18 Agosto'],
  'P': ['P22', 'P05-Rev.18', 'P-13', 'P05'],
  'Q': ['Q22', 'Q05-Rev18'],
  'S': ['S10-Rev23', 'S10-Rev18', 'S10A-Rev18']
};

export default function CareerPage({ params }: PageProps) {
  const { career } = useParams();
  const searchParams = useSearchParams();
  const normalizedPlan = searchParams.get('plan');
  const plan = normalizedPlan ? denormalizePlanId(normalizedPlan) : null;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Subject | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);

  // Redirect to home if career code is invalid
  if (!VALID_CAREERS.includes(career as string)) {
    redirect('/');
  }

  // If no plan is specified or plan is invalid, redirect to the default plan
  const validPlans = CAREER_PLANS[career as keyof typeof CAREER_PLANS]
    .map(p => normalizePlanId(p));
  
  if (!normalizedPlan || !validPlans.includes(normalizedPlan)) {
    const defaultPlan = normalizePlanId(CAREER_PLANS[career as keyof typeof CAREER_PLANS][0]);
    redirect(`/${career}?plan=${defaultPlan}`);
  }

  const handleCommissionSelect = (commissionId: string) => {
    if (selectedCourseForModal) {
      const commission = commissionId === 'any'
        ? { name: 'any' }
        : selectedCourseForModal.commissions.find(c => c.name === commissionId)
          || selectedCourseForModal.commissions[0];

      setSelectedCourses(prev => [
        ...prev,
        {
          ...selectedCourseForModal,
          selectedCommission: commission.name,
          isPriority: false,
        },
      ]);
    }
    setModalOpen(false);
    setSelectedCourseForModal(null);
  };

  const handleReorderCourses = (reorderedCourses: SelectedCourse[]) => {
    setSelectedCourses(reorderedCourses);
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
          setSelectedCourses(prev => prev.filter(c => c.subject_id !== courseId));
        }}
        onReorderCourses={handleReorderCourses}
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
      <TopBar currentPlan={plan || ''} />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <TabView tabs={tabs} />
      </div>

      <CommissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleCommissionSelect}
        commission={selectedCourseForModal?.commissions || []}
        courseName={selectedCourseForModal?.name || ''}
        courseId={selectedCourseForModal?.subject_id || ''}
      />
    </div>
  );
}
