// import React, { useState } from "react";
// import HeartButton from "./HeartButton";

// interface Column {
//   header: string;
//   accessor: string;
// }

// interface CustomTableProps {
//   columns: Column[];
//   data: any[];
// }

// const extractDomain = (url: string) => {
//   try {
//     const hostname = new URL(url).hostname;
//     const domainParts = hostname.split(".");
//     return domainParts.length > 2 ? domainParts[1] : domainParts[0];
//   } catch (error) {
//     console.log("Error extracting domain:", error);
//     return url;
//   }
// };

// const CustomTable: React.FC<CustomTableProps> = ({
//   columns,
//   data: initialData,
// }) => {
//   const [data, setData] = useState(initialData);

//   const handleFavoriteToggle = (rowIndex: number) => {
//     setData((prevData) => {
//       const newData = [...prevData];
//       newData[rowIndex] = {
//         ...newData[rowIndex],
//         favorited: !newData[rowIndex].favorited,
//       };
//       return newData;
//     });
//   };
//   return (
//     <div className="overflow-x-auto">
//       <div className="hidden md:block">
//         <table className="min-w-full">
//           <thead>
//             <tr>
//               {columns.map((column) => (
//                 <th
//                   key={column.accessor}
//                   className="py-2 px-4 text-left uppercaseTitle"
//                 >
//                   {column.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, rowIndex) => (
//               <tr key={rowIndex}>
//                 {columns.map((column) => (
//                   <td key={column.accessor} className="py-2 px-4 text-sm">
//                     {column.accessor === "favorited" ? (
//                       <div className="flex justify-center items-center">
//                         <HeartButton
//                           initialState={row[column.accessor]}
//                           onToggle={() => handleFavoriteToggle(rowIndex)}
//                         />
//                       </div>
//                     ) : column.accessor === "link" ? (
//                       <a
//                         href={row[column.accessor]}
//                         className="text-secondary underline cursor-pointer "
//                       >
//                         {extractDomain(row[column.accessor])}
//                       </a>
//                     ) : (
//                       row[column.accessor]
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="block md:hidden space-y-2">
//         {data.map((row, rowIndex) => (
//           <div
//             key={rowIndex}
//             className="p-2 rounded-lg border border-secondaryBackground"
//           >
//             {columns.map((column) => (
//               <div key={column.accessor} className="mb-1">
//                 <div className="font-semibold uppercaseTitle">
//                   {column.header}
//                 </div>
//                 <div className="text-sm">
//                   {column.accessor === "link" ? (
//                     <a
//                       href={row[column.accessor]}
//                       className="text-secondary underline cursor-pointer text-ellipsis"
//                     >
//                       {extractDomain(row[column.accessor])}
//                     </a>
//                   ) : (
//                     row[column.accessor]
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export type { CustomTableProps, Column };
// export default CustomTable;
