type WeatherType = "rain" | "cloud" | "sun";

type WeatherIconProps = {
  type: WeatherType;
  size?: number;
};

export default function WeatherIcon({
  type,
  size = 72,
}: WeatherIconProps) {
  if (type === "rain") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
      >
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 52c-9 0-16-7-16-16s7-16 16-16c2 0 4 0 5 1 4-8 12-13 22-13 14 0 25 11 25 25v1c7 1 12 7 12 14 0 8-6 14-14 14H30z" />
          <line x1="38" y1="66" x2="34" y2="78" />
          <line x1="52" y1="66" x2="48" y2="78" />
          <line x1="66" y1="66" x2="62" y2="78" />
        </g>
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
      >
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="18" />
          <line x1="50" y1="10" x2="50" y2="22" />
          <line x1="50" y1="78" x2="50" y2="90" />
          <line x1="10" y1="50" x2="22" y2="50" />
          <line x1="78" y1="50" x2="90" y2="50" />
          <line x1="22" y1="22" x2="30" y2="30" />
          <line x1="70" y1="70" x2="78" y2="78" />
          <line x1="22" y1="78" x2="30" y2="70" />
          <line x1="70" y1="30" x2="78" y2="22" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
    >
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 60c-9 0-16-7-16-16s7-16 16-16c2 0 4 0 5 1 4-8 12-13 22-13 14 0 25 11 25 25v1c7 1 12 7 12 14 0 8-6 14-14 14H30z" />
      </g>
    </svg>
  );
}