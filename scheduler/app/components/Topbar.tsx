import React, { useState, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useClickOutside from "../hooks/useClickOutside";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CAREERS,
  AVAILABLE_PLANS,
  CAREER_METADATA,
  EXCHANGE_CAREER,
} from "../types/careers";

interface TopbarProps {
  currentPlan: string;
}

const Topbar = ({ currentPlan }: TopbarProps) => {
  const params = useParams();
  const router = useRouter();
  const careerCode = (params?.career as string) || "S";
  const careerName = CAREERS[careerCode] || "";
  const plans = AVAILABLE_PLANS[careerCode] || [];
  const hasMultiplePlans = plans.length > 1;
  const careerIcon =
    careerCode === "X"
      ? EXCHANGE_CAREER.icon
      : CAREER_METADATA[careerCode]?.icon;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () =>
    setIsDropdownOpen(false)
  );

  const handlePlanChange = (planId: string) => {
    setIsDropdownOpen(false);
    router.push(`/${careerCode}?plan=${planId}`);
  };

  return (
    <div className="w-full bg-background border-gray/20 relative z-50 pt-4 px-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-auto items-center justify-between">
          {/* Logo or Brand */}
          <Link
            href="/"
            className="flex-shrink-0 group hover:opacity-80 transition-opacity flex flex-col justify-center"
          >
            <h2 className="text-lg md:text-xl lg:text-xl font-semibold text-textDefault whitespace-normal">
              CEITBA
              <span className="hidden sm:inline">
                {" "}
                | Combinador de Horarios
              </span>
            </h2>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm lg:text-xl">
                {careerIcon}
              </span>
              <h2 className="text-xs sm:text-sm lg:text-base text-gray">
                {careerName.startsWith("Ingeniería")
                  ? careerName.replace("Ingeniería", "Ing.")
                  : careerName.startsWith("Licenciatura")
                  ? careerName.replace("Licenciatura", "Lic.")
                  : careerName}
              </h2>
            </div>
          </Link>

          {/* Right side with Plan and Theme */}
          <div className="flex items-center">
            {hasMultiplePlans && (
              <div className="">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-md hover:bg-secondaryBackground"
                  >
                    <span className="text-sm lg:text-base font-medium">
                      {currentPlan}
                    </span>
                    <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-1 w-36 sm:w-48 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handlePlanChange(plan.id)}
                            className={`block w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
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
            <div className="">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
