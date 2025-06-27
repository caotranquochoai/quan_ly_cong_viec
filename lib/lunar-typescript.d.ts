declare module 'lunar-typescript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    toFullString(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromDate(date: Date): Lunar;
    getSolar(): Solar;
    toFullString(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    isLeap: boolean;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getAnimal(): string;
    getJieQi(): string;
  }
}