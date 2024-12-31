import React, { useState, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useClickOutside from "../hooks/useClickOutside";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
}

const AVAILABLE_PLANS: { [key: string]: Plan[] } = {
  'S': [
    { id: "SREV-23", name: "Plan 2023" },
    { id: "SREV-19", name: "Plan 2019" },
    { id: "SREV-14", name: "Plan 2014" },
  ]
};

// Career mapping object
const CAREERS: { [key: string]: string } = {
  "S": "Ingeniería Informática"
  // Add more careers as needed
};

interface TopbarProps {
  currentPlan: string;
}

const Topbar = ({ currentPlan }: TopbarProps) => {
  const params = useParams();
  const router = useRouter();
  const careerCode = params?.career as string || "S";
  const careerName = CAREERS[careerCode] || "Carrera no encontrada";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsDropdownOpen(false));

  const currentPlanData = AVAILABLE_PLANS[careerCode]?.find(p => p.id === currentPlan) 
    || AVAILABLE_PLANS[careerCode]?.[0];

  const handlePlanChange = (planId: string) => {
    setIsDropdownOpen(false);
    router.push(`/${careerCode}?plan=${planId}`);
  };

  return (
    <div className="w-full bg-background border-gray/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo or Brand */}
          <Link 
            href="/" 
            className="flex-shrink-0 group hover:opacity-80 transition-opacity"
          >
            <h2 className="text-xl font-semibold text-primary group-hover:text-secondary">
              Combinador de Horarios
            </h2>
            <h2 className="font-medium text-gray">
              {careerName}
            </h2>
          </Link>

          {/* Right side with Plan and Theme */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-secondaryBackground"
                >
                  <span className="font-medium">{currentPlanData?.name}</span>
                  <ChevronDownIcon className="h-4 w-4 text-gray" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {AVAILABLE_PLANS[careerCode]?.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => handlePlanChange(plan.id)}
                          className={`block w-full px-4 py-2 text-sm ${
                            currentPlan === plan.id
                              ? "bg-primary/10 text-primary"
                              : "text-textDefault hover:bg-secondaryBackground"
                          }`}
                        >
                          {plan.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
