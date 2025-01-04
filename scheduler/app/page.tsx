"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  CAREERS,
  CAREER_METADATA,
  EXCHANGE_CAREER,
  getLatestPlan,
} from "./types/careers";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      staggerDirection: 1,
      when: "beforeChildren",
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Home() {
  useTheme();

  // Create the careers array from our types
  const careersList = Object.entries(CAREERS).map(([id, name]) => ({
    id,
    name,
    latestPlan: getLatestPlan(id),
    icon: CAREER_METADATA[id].icon,
  }));

  // Calculate the total animation duration for regular cards
  const totalAnimationDuration = careersList.length * 0.1 + 0.2; // staggerChildren * number of items + initial delay

  return (
    <div className="w-full flex-1 flex flex-col">
    <div className="flex-1 w-full px-4 md:px-6 lg:px-8 py-8 flex flex-col items-center">
    <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            CEITBA | Combinador de Horarios
          </h1>
          <p className="text-muted-foreground">
            Selecciona tu carrera para comenzar a planificar tu horario
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-8 w-full max-w-7xl">
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl w-full"
          >
            {careersList.map((career) => (
              <motion.div
                key={career.id}
                variants={item}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/${career.id}?plan=${career.latestPlan}`}>
                  <div className="group relative overflow-hidden rounded-xl p-4 bg-surface hover:shadow-lg transition-all duration-300 border border-border min-h-[100px] flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{career.icon}</span>
                      <h2 className="text-lg font-semibold leading-tight">
                        {career.name}
                      </h2>
                    </div>

                    <div className="mt-3 flex items-center text-primary text-sm">
                      <span>Ver Horarios</span>
                      <svg
                        className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Special Exchange Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: totalAnimationDuration + 0.3, // Add extra delay after all cards
              duration: 0.5,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-md"
          >
            <Link
              href={`/${EXCHANGE_CAREER.id}?plan=${getLatestPlan(
                EXCHANGE_CAREER.id
              )}`}
            >
              <div className="group relative overflow-hidden rounded-xl p-4 bg-surface hover:shadow-lg transition-all duration-300 border-2 border-dashed border-primary/30 hover:border-primary/50">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{EXCHANGE_CAREER.icon}</span>
                  <h2 className="text-lg font-semibold leading-tight">
                    {EXCHANGE_CAREER.name}
                  </h2>
                  <svg
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
