"use client";
import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
const SearchBox: React.FC = () => {
  const [query, setQuery] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="flex items-center rounded-2xl bg-secondaryBackground my-1 group focus-within:ring-2 focus-within:ring-textDefault">
      <div className="ps-4 pe-4">
        <MagnifyingGlassIcon className="w-6 h-6 text-gray group-focus-within:text-textDefault" />
      </div>
      <input
        className="w-full bg-secondaryBackground p-2 text-lg rounded-2xl 
        focus-visible:outline-none text-textDefault placeholder:text-gray"
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Buscar por código o nombre de materia"
      />
    </div>
  );
};

export default SearchBox;
