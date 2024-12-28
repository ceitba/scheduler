import React from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";

const TopBar = () => {
  return (
    <div className="flex justify-between items-center px-4 md:px-6 min-h-[4rem] z-50">
      <div className="flex items-center space-x-4 md:space-x-4 w-full h-full">
            <Link href="/">
              <h1 className="title text-primary md:inline hover:text-secondary select-none">Combinador de Horarios</h1>
            </Link>
      </div>
      <div className="flex items-center md:space-x-4 h-full">
        <div className="hidden md:inline">
          <ThemeSwitcher />
        </div>
        {/* <ClickeableIcon
          icon={<UserCircleIcon className="h-6 w-6" />}
          text="Ingresar"
          onClick={() => console.log("User icon clicked")}
        /> */}
      </div>
    </div>
  );
};

export default TopBar;
