import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"
import { format as formatDate } from "date-fns"

// Common timezones list
export const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "+00:00" },
  { value: "America/New_York", label: "Eastern Time (New York)", offset: "-05:00/-04:00" },
  { value: "America/Chicago", label: "Central Time (Chicago)", offset: "-06:00/-05:00" },
  { value: "America/Denver", label: "Mountain Time (Denver)", offset: "-07:00/-06:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", offset: "-08:00/-07:00" },
  { value: "America/Toronto", label: "Eastern Time (Toronto)", offset: "-05:00/-04:00" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)", offset: "-08:00/-07:00" },
  { value: "Europe/London", label: "Greenwich Mean Time (London)", offset: "+00:00/+01:00" },
  { value: "Europe/Paris", label: "Central European Time (Paris)", offset: "+01:00/+02:00" },
  { value: "Europe/Berlin", label: "Central European Time (Berlin)", offset: "+01:00/+02:00" },
  { value: "Europe/Rome", label: "Central European Time (Rome)", offset: "+01:00/+02:00" },
  { value: "Europe/Madrid", label: "Central European Time (Madrid)", offset: "+01:00/+02:00" },
  { value: "Europe/Amsterdam", label: "Central European Time (Amsterdam)", offset: "+01:00/+02:00" },
  { value: "Europe/Stockholm", label: "Central European Time (Stockholm)", offset: "+01:00/+02:00" },
  { value: "Europe/Moscow", label: "Moscow Standard Time", offset: "+03:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)", offset: "+08:00" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time", offset: "+08:00" },
  { value: "Asia/Singapore", label: "Singapore Standard Time", offset: "+08:00" },
  { value: "Asia/Seoul", label: "Korea Standard Time (Seoul)", offset: "+09:00" },
  { value: "Asia/Kolkata", label: "India Standard Time (Mumbai)", offset: "+05:30" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", offset: "+04:00" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)", offset: "+10:00/+11:00" },
  { value: "Australia/Melbourne", label: "Australian Eastern Time (Melbourne)", offset: "+10:00/+11:00" },
  { value: "Australia/Perth", label: "Australian Western Time (Perth)", offset: "+08:00" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (Auckland)", offset: "+12:00/+13:00" },
  { value: "Asia/Ho_Chi_Minh", label: "Indochina Time (Ho Chi Minh City)", offset: "+07:00" },
]

// Get user's system timezone
export const getSystemTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Format date in user's timezone
export const formatInUserTimezone = (date: Date, timezone: string, formatStr = "yyyy-MM-dd HH:mm:ss"): string => {
  try {
    return formatInTimeZone(date, timezone, formatStr)
  } catch (error) {
    console.error("Error formatting date in timezone:", error)
    return formatDate(date, formatStr)
  }
}

// Convert UTC date to user's timezone
export const convertToUserTimezone = (utcDate: Date, timezone: string): Date => {
  try {
    return toZonedTime(utcDate, timezone)
  } catch (error) {
    console.error("Error converting to user timezone:", error)
    return utcDate
  }
}

// Convert user's timezone date to UTC
export const convertToUTC = (localDate: Date, timezone: string): Date => {
  try {
    return fromZonedTime(localDate, timezone)
  } catch (error) {
    console.error("Error converting to UTC:", error)
    return localDate
  }
}

// Get current time in different timezones
export const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd HH:mm:ss")
  } catch (error) {
    console.error("Error getting current time in timezone:", error)
    return formatDate(new Date(), "yyyy-MM-dd HH:mm:ss")
  }
}

// Get timezone offset
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezone }))
    const diff = targetTime.getTime() - utc.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    const sign = hours >= 0 ? "+" : "-"
    const absHours = Math.abs(hours).toString().padStart(2, "0")
    const absMinutes = Math.abs(minutes).toString().padStart(2, "0")

    return `${sign}${absHours}:${absMinutes}`
  } catch (error) {
    console.error("Error getting timezone offset:", error)
    return "+00:00"
  }
}

// Check if timezone is valid
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}
