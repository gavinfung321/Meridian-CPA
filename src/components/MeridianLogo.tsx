interface MeridianLogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export const MeridianLogo = ({
  variant = "light",
  className = "",
}: MeridianLogoProps): JSX.Element => {
  const fill = variant === "light" ? "#FFFFFF" : "#0F2A1D";

  return (
    <svg
      className={className}
      width="132"
      height="40"
      viewBox="0 0 132 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Meridian CPA"
    >
      {/* Compass-M mark */}
      <g transform="translate(0, 2)">
        {/* Horizontal compass points */}
        <path d="M2 18 L10 14.5 L10 21.5 Z" fill={fill} />
        <path d="M34 18 L26 14.5 L26 21.5 Z" fill={fill} />
        {/* Vertical needle */}
        <rect x="17.35" y="0" width="1.3" height="36" fill={fill} />
        {/* Stylized M */}
        <path
          d="M8 28 V10 L18 22 L28 10 V28"
          stroke={fill}
          strokeWidth="2.4"
          strokeLinejoin="miter"
          fill="none"
        />
        {/* Outer M legs (double-line feel) */}
        <path
          d="M6.2 28 V9.2 M29.8 28 V9.2"
          stroke={fill}
          strokeWidth="1.2"
          fill="none"
        />
      </g>

      {/* Wordmark */}
      <text
        x="42"
        y="18"
        fill={fill}
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="11"
        fontWeight="600"
        letterSpacing="1.6"
      >
        MERIDIAN
      </text>
      <text
        x="42"
        y="32"
        fill={fill}
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="9"
        fontWeight="500"
        letterSpacing="2.4"
      >
        CPA
      </text>
    </svg>
  );
};
