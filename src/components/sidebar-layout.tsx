"use client";

import { cn } from "@/lib/utils";
import {
  HomeIcon,
  LucideChevronDown,
  LucideMenu,
  LucideSettings,
  LucideUser,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const MENU_STATE_KEY = "activeMenu";
const SIDEBAR_VISIBLE_KEY = "sidebarVisible";

const menuItems = [
  {
    title: "Cadastros",
    icon: LucideUser,
    key: "cadastros",
    subItems: [
      { title: "Tipos despesas", path: "/expenses-types" },
      { title: "Despesas", path: "/expenses" },
    ],
  },
  {
    title: "Configurações",
    icon: LucideSettings,
    key: "configuracoes",
    subItems: [
      { title: "Fechar Despesas", path: "/close-expenses" },
      { title: "Ajustes", path: "/configuracoes/ajustes" },
    ],
  },
];

const SidebarLayout = (props: SidebarLayoutProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedMenu = localStorage.getItem(MENU_STATE_KEY);
    if (storedMenu) setActiveMenu(storedMenu);

    const storedSidebar = localStorage.getItem(SIDEBAR_VISIBLE_KEY);
    setSidebarVisible(storedSidebar !== "false");
  }, []);

  const toggleMenu = (key: string) => {
    const newState = activeMenu === key ? null : key;
    setActiveMenu(newState);
    localStorage.setItem(MENU_STATE_KEY, newState ?? "");
  };

  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    setSidebarVisible(newState);
    localStorage.setItem(SIDEBAR_VISIBLE_KEY, newState.toString());
  };

  const handleSubItemClick = (path: string) => {
    router.push(path);
    setSidebarVisible(false); // Fecha o sidebar ao clicar em um item
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 bg-white p-2 shadow-md rounded-md md:hidden"
      >
        <LucideMenu className="w-6 h-6" />
      </button>

      {/* Overlay para o menu no mobile */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={cn(
          "bg-white p-4 shadow-md transition-transform duration-300 z-40 h-full relative md:translate-x-0 pt-20 md:pt-2",
          sidebarVisible
            ? "translate-x-0 w-64 fixed top-0 left-0 md:block"
            : "-translate-x-full w-64 fixed top-0 left-0 md:block"
        )}
      >
        <Card className="mb-2">
          <Link
            href="/"
            onClick={() => {
              toggleMenu("home");
              handleSubItemClick("/");
            }}
            key="home"
          >
            <div
              key="home"
              className="flex items-center gap-2 p-4 hover:bg-gray-100 cursor-pointer"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </div>
          </Link>
        </Card>

        {menuItems.map(({ title, icon: Icon, key, subItems }) => (
          <Card key={key} className="mb-2">
            <div
              onClick={() => toggleMenu(key)}
              className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{title}</span>
              </div>
              <LucideChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  activeMenu === key ? "rotate-180" : "rotate-0"
                )}
              />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                activeMenu === key ? "max-h-40" : "max-h-0"
              )}
            >
              {subItems.map((sub) => (
                <Link
                  href={sub.path}
                  onClick={() => handleSubItemClick(sub.path)}
                  key={sub.title}
                >
                  <div
                    key={sub.title}
                    className="pl-10 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {sub.title}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </aside>

      <main className="flex-1 p-6 md:ml-64">{props.children}</main>
    </div>
  );
};

export default SidebarLayout;
