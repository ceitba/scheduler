import { Link } from "react-router-dom"
import React from "react"

interface Subject {
  name: string
  link: string
  semester: number
}

interface SubjectListProps {
  semester: number
  subjects: Subject[]
}

const SubjectList: React.FC<SubjectListProps> = ({ semester, subjects }) => {
  return (
    <div>
      <h2 className="font-body font-semibold text-body-sm text-ink-primary mb-2">
        {semester === 1 ? "Primer cuatrimestre" : "Segundo cuatrimestre"}
      </h2>
      <ul className="list-disc pl-10">
        {subjects.map((subject, index) => (
          <li key={index} className="mb-1">
            <Link to={subject.link} className="font-body text-body-sm text-primary hover:underline">
              {subject.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export type { Subject }
export { SubjectList }
