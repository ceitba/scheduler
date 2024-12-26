import React from "react";
import ClickeableIcon from "./ClickeableIcon";
import { BookmarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import SearchBox from "./SearchBox";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";

interface TopBarProps {
  showTitle?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  showTitle = true,
}) => {
  return (
    <div className="flex justify-between items-center px-2 md:px-6 min-h-[4rem] z-50">
      <div className="flex items-center space-x-0 md:space-x-4 w-full h-full">
            <Link href="/">
              <h1 className="title text-secondary hidden md:inline hover:text-primary select-none">Scheduler</h1>
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
