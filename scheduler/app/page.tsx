"use client";
import TabView from "./components/TabView";
import CourseView from "./components/CourseView";
import SettingsView from "./components/SettingsView";
import SchedulerPreview from "./components/SchedulerPreview";
import TopBar from "./components/Topbar";

export default function Home() {
  const tabs = [
    {
      label: "Cursos",
      content: <CourseView />,
    },
    {
      label: "Configuración",
      content: <SettingsView />,
    },
    {
      label: "Vista Previa",
      content: <SchedulerPreview />,
    },
  ];

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Materias", href: "/subjects" },
  ];

  return (
    <>
    <div className="">
    <TopBar />
      <div className="container mx-auto">
        <TabView tabs={tabs} />
      </div>
    </div>
    </>
  );
}
