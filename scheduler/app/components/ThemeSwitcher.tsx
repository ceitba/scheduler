import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import ClickeableIcon from "./ClickeableIcon";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.theme || 'light';
    }
    return 'light';
});

useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.theme) {
            setTheme(localStorage.theme);
            document.documentElement.classList.add(localStorage.theme);
        } else {
            localStorage.theme = 'light';
            document.documentElement.classList.add('light');
        }
    }
}, []);

const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.theme = newTheme;
  }
  setTheme(newTheme);
  document.documentElement.classList.remove(theme);
  document.documentElement.classList.add(newTheme);
};

  return (
    <ClickeableIcon
      icon={
        theme === "light" ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )
      }
      onClick={toggleTheme}
    />
  );
};

export default ThemeSwitcher;
