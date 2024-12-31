"use client";
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBox = () => {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon 
          className="h-5 w-5 text-gray transition-colors" 
          aria-hidden="true" 
        />
      </div>
      <input
        type="text"
        placeholder="Buscar materia por nombre o codigo..."
        className="w-full pl-10 pr-3 py-2.5
          bg-transparent
          border border-gray/20 rounded-lg
          text-textDefault placeholder:text-gray
          focus:border-primary focus:ring-1 focus:ring-primary/10
          hover:border-gray/30
          focus:outline-none
          transition-all duration-200"
      />
    </div>
  );
};

export default SearchBox;
