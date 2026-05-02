import React, { useState } from "react"
import HeartButton from "./HeartButton"

interface Column {
  header: string
  accessor: string
}

interface CustomTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
}

const extractDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname
    const domainParts = hostname.split(".")
    return domainParts.length > 2 ? domainParts[1] : domainParts[0]
  } catch (error) {
    console.log("Error extracting domain:", error)
    return url
  }
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data: initialData,
}) => {
  const [data, setData] = useState(initialData)

  const handleFavoriteToggle = (rowIndex: number) => {
    setData((prevData) => {
      const newData = [...prevData]
      newData[rowIndex] = {
        ...newData[rowIndex],
        favorited: !newData[rowIndex].favorited,
      }
      return newData
    })
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden md:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-4 py-3 text-left font-mono text-label uppercase tracking-widest text-ink-secondary"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border hover:bg-primary-50 transition-colors duration-100">
                {columns.map((column) => (
                  <td key={column.accessor} className="px-4 py-3 font-body text-body-sm text-ink-primary">
                    {column.accessor === "favorited" ? (
                      <div className="flex justify-center items-center">
                        <HeartButton
                          initialState={row[column.accessor] as boolean}
                          onToggle={() => handleFavoriteToggle(rowIndex)}
                        />
                      </div>
                    ) : column.accessor === "link" ? (
                      <a
                        href={row[column.accessor] as string}
                        className="text-primary underline cursor-pointer hover:text-primary-600"
                      >
                        {extractDomain(row[column.accessor] as string)}
                      </a>
                    ) : (
                      String(row[column.accessor] ?? '')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden space-y-2">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="p-3 rounded-card border border-border bg-white shadow-card"
          >
            {columns.map((column) => (
              <div key={column.accessor} className="mb-2">
                <div className="font-mono text-label uppercase tracking-widest text-ink-secondary mb-0.5">
                  {column.header}
                </div>
                <div className="font-body text-body-sm text-ink-primary">
                  {column.accessor === "link" ? (
                    <a
                      href={row[column.accessor] as string}
                      className="text-primary underline cursor-pointer"
                    >
                      {extractDomain(row[column.accessor] as string)}
                    </a>
                  ) : (
                    String(row[column.accessor] ?? '')
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export type { CustomTableProps, Column }
export default CustomTable
