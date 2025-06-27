import { Lunar, Solar } from "lunar-typescript";
import type { LunarDateInfo } from "./types";

export const getLunarDateInfo = (date: Date): LunarDateInfo => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeap: lunar.isLeap,
    chineseMonth: lunar.getMonthInChinese(),
    chineseDay: lunar.getDayInChinese(),
    zodiac: lunar.getAnimal(),
    solarTerm: lunar.getJieQi(),
  };
};

export const convertLunarToSolar = (
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false
): Date => {
  const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
};

export const convertSolarToLunar = (
  year: number,
  month: number,
  day: number
): LunarDateInfo => {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeap: lunar.isLeap,
    chineseMonth: lunar.getMonthInChinese(),
    chineseDay: lunar.getDayInChinese(),
    zodiac: lunar.getAnimal(),
    solarTerm: lunar.getJieQi(),
  };
};

export const formatLunarDate = (lunarInfo: LunarDateInfo, language: string): string => {
  const { year, chineseMonth, chineseDay, isLeap, zodiac, solarTerm } = lunarInfo;
  let formatted = "";

  if (language === "vi") {
    formatted = `Ngày ${chineseDay} tháng ${chineseMonth}${isLeap ? " nhuận" : ""} năm ${zodiac} (${year} ÂL)`;
    if (solarTerm) {
      formatted += ` - ${solarTerm}`;
    }
  } else if (language === "zh") {
    formatted = `${year}年${chineseMonth}${isLeap ? "闰" : ""}月${chineseDay} (属${zodiac})`;
    if (solarTerm) {
      formatted += ` - ${solarTerm}`;
    }
  } else {
    // Default to English
    formatted = `${isLeap ? "Leap " : ""}${chineseMonth} ${chineseDay}, ${year} (${zodiac} year)`;
    if (solarTerm) {
      formatted += ` - ${solarTerm}`;
    }
  }
  return formatted;
};