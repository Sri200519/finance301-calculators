"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full flex items-center justify-center space-x-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
      <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
    </Button>
  )
}
