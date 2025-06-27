"use client"
import type { Language } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

const languageOptions = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "vi" as Language, name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh" as Language, name: "中文", flag: "🇨🇳" },
]

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const currentOption = languageOptions.find((option) => option.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 sm:w-48">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => onLanguageChange(option.code)}
            className={`flex items-center gap-3 text-sm ${currentLanguage === option.code ? "bg-accent" : ""}`}
          >
            <span className="text-base sm:text-lg">{option.flag}</span>
            <span className="flex-1 text-xs sm:text-sm">{option.name}</span>
            {currentLanguage === option.code && <span className="text-xs text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
