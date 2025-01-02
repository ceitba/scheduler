import React, { useState, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useClickOutside from "../hooks/useClickOutside";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CAREERS, AVAILABLE_PLANS, CAREER_METADATA, EXCHANGE_CAREER } from "../types/careers";

interface TopbarProps {
  currentPlan: string;
}

const Topbar = ({ currentPlan }: TopbarProps) => {
  const params = useParams();
  const router = useRouter();
  const careerCode = params?.career as string || "S";
  const careerName = CAREERS[careerCode] || "";
  const plans = AVAILABLE_PLANS[careerCode] || [];
  const hasMultiplePlans = plans.length > 1;
  const careerIcon = careerCode === 'X' ? EXCHANGE_CAREER.icon : CAREER_METADATA[careerCode]?.icon;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsDropdownOpen(false));

  const handlePlanChange = (planId: string) => {
    setIsDropdownOpen(false);
    router.push(`/${careerCode}?plan=${planId}`);
  };

  return (
    <div className="w-full bg-background border-gray/20 relative z-50 pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo or Brand */}
          <Link 
            href="/" 
            className="flex-shrink-0 group hover:opacity-80 transition-opacity flex flex-col justify-center"
          >
            <h2 className="text-xl font-semibold text-textDefault">
              CEITBA | Combinador de Horarios
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{careerIcon}</span>
              <h2 className="font-medium text-gray">
                {careerName}
              </h2>
            </div>
          </Link>

          {/* Right side with Plan and Theme */}
          <div className="flex items-center space-x-6">
            {hasMultiplePlans && (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-secondaryBackground"
                  >
                    <span className="font-medium">{currentPlan}</span>
                    <ChevronDownIcon className="h-4 w-4 text-gray" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handlePlanChange(plan.id)}
                            className={`block w-full px-4 py-2 text-sm ${
                              currentPlan === plan.id
                                ? "bg-primary/10 text-primary"
                                : "text-textDefault hover:bg-secondaryBackground"
                            }`}
                          >
                            {plan.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
