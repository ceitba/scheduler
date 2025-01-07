"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Subject } from "../hooks/useSubjects";
import Fuse from 'fuse.js';

interface SearchBoxProps {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ subjects, onSelectSubject }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse instance with our search options
  const fuse = useMemo(() => new Fuse(subjects, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'subject_id', weight: 0.3 }
    ],
    threshold: 0.35, // 0.0 = perfect match, 1.0 = match anything
    includeScore: true,
    minMatchCharLength: 2,
    shouldSort: true,
    findAllMatches: true
  }), [subjects]);

  // Filter subjects based on fuzzy search
  const filteredSubjects = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(result => result.item);
  }, [fuse, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar materias por nombre o código..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondaryBackground 
            text-sm text-textDefault placeholder:text-gray
            border border-transparent focus:border-gray focus:border-2
            outline-none transition-colors"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && query.length > 0 && (
        <div className="absolute w-full mt-2 bg-background rounded-lg shadow-lg border-2 border-gray max-h-60 overflow-y-auto z-50">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <button
                key={subject.subject_id}
                onClick={() => {
                  onSelectSubject(subject);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-secondaryBackground 
                  transition-colors duration-150 text-sm"
              >
                <span className="text-textDefault">
                  ({subject.subject_id}) {subject.name}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray">
              No se encontraron materias
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
