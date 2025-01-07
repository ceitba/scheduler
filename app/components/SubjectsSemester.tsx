import Link from "next/link";
import React from "react";

interface Subject {
  name: string;
  link: string;
  semester: number;
}

interface SubjectListProps {
  semester: number;
  subjects: Subject[];
}

const SubjectList: React.FC<SubjectListProps> = ({ semester, subjects }) => {
  return (
    <div>
      <h2>{semester === 1 ? "Primer cuatrimestre" : "Segundo cuatrimestre"}</h2>
      <ul className="list-disc pl-10">
        {subjects.map((subject, index) => (
          <li key={index} className="mb-1 link">
            <Link href={subject.link} className="text-secondary">
              {subject.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export type { Subject };
export { SubjectList };
