"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/lib/i18n"
import type { Language } from "@/lib/types"

interface RecurringTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scope: "single" | "all_future") => void
  actionType: "update" | "delete"
  language: Language
}

export default function RecurringTaskDialog({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  language,
}: RecurringTaskDialogProps) {
  const t = useTranslation(language)

  const title = actionType === "update" ? t.recurringUpdateTitle : t.recurringDeleteTitle
  const description = actionType === "update" ? t.recurringUpdateDescription : t.recurringDeleteDescription

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm("single")}>
            {actionType === "update" ? t.updateThisTaskOnly : t.deleteThisTaskOnly}
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onConfirm("all_future")}>
            {actionType === "update" ? t.updateFutureTasks : t.deleteFutureTasks}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}