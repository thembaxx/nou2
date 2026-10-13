export function ObjectIllustration({
  kind,
}: {
  kind: "engine" | "battery" | "hybrid" | "hydrogen";
}) {
  return (
    <svg
      className="object-illustration"
      viewBox="0 0 220 130"
      role="img"
      aria-label={`${kind} technology illustration`}
    >
      <ellipse cx="112" cy="112" rx="90" ry="10" fill="#1b2c43" />
      {kind === "engine" ? (
        <g>
          <path d="M47 51 L122 29 L174 56 L98 82 Z" fill="#718398" />
          <path d="M47 51 L98 82 L98 110 L47 79 Z" fill="#3f566f" />
          <path d="M98 82 L174 56 L174 87 L98 110 Z" fill="#253b55" />
          {[0, 1, 2, 3].map((i) => (
            <g className="piston" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              <path d={`M${65 + i * 20} ${40 - i * 5} v-20 l12 -4 v20 Z`} fill="#cda971" />
              <ellipse cx={71 + i * 20} cy={20 - i * 5} rx="8" ry="4" fill="#eed1a3" />
            </g>
          ))}
        </g>
      ) : kind === "hydrogen" ? (
        <g>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i * 15},${i * 33}) rotate(-12 100 45)`}>
              <rect
                x="40"
                y="25"
                width="135"
                height="29"
                rx="14"
                fill={i ? "#76aec7" : "#a5d0df"}
              />
              <ellipse cx="175" cy="40" rx="8" ry="14" fill="#315f7a" />
              <path d="M183 40 h14" stroke="#c7e1e8" strokeWidth="7" />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <path d="M29 65 L130 29 L188 60 L87 99 Z" fill="#2c566c" stroke="#5797ac" />
          <path d="M29 65 L87 99 V111 L29 77 Z M87 99 L188 60 V72 L87 111 Z" fill="#19364d" />
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${45 + (i % 4) * 23 + Math.floor(i / 4) * 13} ${62 - (i % 4) * 8 + Math.floor(i / 4) * 9} l16 -6 l9 5 l-16 6 Z`}
              fill={kind === "hybrid" && i > 7 ? "#ddb272" : "#68d4d0"}
              className="battery-cell"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
          <path
            d="M174 40 l10 -3 l-6 10 l10 -3 l-11 17"
            fill="none"
            stroke="#92ece9"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
}
