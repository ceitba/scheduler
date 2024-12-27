"use client";
import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
const SearchBox: React.FC = () => {
  const [query, setQuery] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="relative flex items-center rounded-lg border border-gray/20 bg-background hover:border-gray/30 focus-within:border-secondary mx-1 md:mx-3">
      <div className="pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray group-focus-within:text-textDefault" />
      </div>
      <input
        className="w-full bg-transparent py-2 px-3 text-base placeholder:text-gray/70
          text-textDefault focus:outline-none"
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Buscar por código o nombre de materia"
      />
    </div>
  );
};

export default SearchBox;
