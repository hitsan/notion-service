const weatherCodeToIcon = (code: number): string => {
  if (code <= 1) return "☀️";
  if (code <= 3) return "☁️";
  if (code <= 59) return "🌫️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌧️";
  if (code <= 94) return "❄️";
  if (code <= 99) return "🌩️";
  throw new Error(`Illegal weather code: ${code}`);
};

export const createOpenMeteoApiClient = () => ({
  async fetchWeatherInfo(date: string): Promise<string> {
    const url =
      "https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69" +
      `&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
    const data = await res.json() as any;
    const hourly = data.hourly;
    return [13, 19]
      .map((hour) => {
        const icon = weatherCodeToIcon(hourly.weathercode[hour]);
        const temp = Math.round(hourly.temperature_2m[hour]);
        return `${icon}${temp}`;
      })
      .join("");
  },
});

export type OpenMeteoApiClient = ReturnType<typeof createOpenMeteoApiClient>;
