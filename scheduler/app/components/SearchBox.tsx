"use client";
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBox: React.FC = () => {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
      <input
        type="text"
        placeholder="Buscar materias..."
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondaryBackground 
          text-sm text-textDefault placeholder:text-gray
          border border-transparent focus:border-gray focus:border-2
          outline-none transition-colors"
      />
    </div>
  );
};

export default SearchBox;
