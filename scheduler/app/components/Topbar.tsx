import React, { useState, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useClickOutside from "../hooks/useClickOutside";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Plan {
  id: string;
}

const AVAILABLE_PLANS: { [key: string]: Plan[] } = {
  'BIO': [{ id: "BIO 22" }, { id: "Bio-13" }],
  'C': [{ id: "C23" }],
  'E': [{ id: "E 11" }, { id: "E 11A" }],
  'I': [{ id: "I22" }, { id: "I-13" }, { id: "I-13T" }],
  'K': [{ id: "K22" }, { id: "K07-Rev.18" }, { id: "K07A-Rev.18" }],
  'L': [{ id: "L09" }, { id: "L09-REV13" }, { id: "L09T" }],
  'LAES': [{ id: "A17" }, { id: "A22" }],
  'LN': [{ id: "L20" }],
  'M': [{ id: "M22" }, { id: "M09-Rev18 (Marzo)" }, { id: "M09-Rev18 (Agosto)" }],
  'N': [{ id: "N22" }, { id: "N18 Marzo" }, { id: "N18 Agosto" }],
  'P': [{ id: "P22" }, { id: "P05-Rev.18" }, { id: "P-13" }, { id: "P05" }],
  'Q': [{ id: "Q22" }, { id: "Q05-Rev18" }],
  'S': [{ id: "S10-Rev23" }, { id: "S10-Rev18" }, { id: "S10A-Rev18" }],
};

// Career mapping object
const CAREERS: { [key: string]: string } = {
  "BIO": "Bioingeniería",
  "C": "Ingeniería Civil",
  "E": "Ingeniería Electricista",
  "I": "Ingeniería Industrial",
  "K": "Ingeniería Electrónica",
  "L": "Lic.en Administración y Sistemas",
  "LAES": "Licenciatura en Analítica Empresarial y Social",
  "LN": "Licenciatura en Negocios",
  "M": "Ingeniería Mecánica",
  "N": "Ingeniería Naval",
  "P": "Ingeniería en Petróleo",
  "Q": "Ingeniería Química",
  "S": "Ingeniería en Informática",
  "X": "Intercambio"
};

interface TopbarProps {
  currentPlan: string;
}

const Topbar = ({ currentPlan }: TopbarProps) => {
  const params = useParams();
  const router = useRouter();
  const careerCode = params?.career as string || "S";
  const careerName = CAREERS[careerCode] || "";

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
            <h2 className="font-medium text-gray">
              {careerName}
            </h2>
          </Link>

          {/* Right side with Plan and Theme */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-secondaryBackground"
                >
                  <span className="font-medium">{currentPlanData?.id}</span>
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
                          {plan.id}
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
