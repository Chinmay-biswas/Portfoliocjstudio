import { motion } from "framer-motion";

export default function BottomWaves() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-52 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/75 to-transparent" />

      <motion.svg
        className="absolute bottom-0 left-[-8%] h-36 w-[116%]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        animate={{ x: ["0%", "3%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <path
          d="M0 108 C120 52 240 166 360 106 C480 46 600 26 720 94 C840 162 960 166 1080 102 C1200 38 1320 54 1440 118 L1440 220 L0 220 Z"
          fill="rgba(107,39,176,0.16)"
        />
        <path
          d="M0 108 C120 52 240 166 360 106 C480 46 600 26 720 94 C840 162 960 166 1080 102 C1200 38 1320 54 1440 118"
          fill="none"
          stroke="rgba(107,39,176,0.45)"
          strokeWidth="2"
        />
      </motion.svg>

      <motion.svg
        className="absolute bottom-[-18px] left-[-12%] h-40 w-[124%]"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        animate={{ x: ["0%", "-4%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <path
          d="M0 132 C150 190 300 56 450 128 C600 200 720 182 870 112 C1020 42 1200 72 1440 150 L1440 240 L0 240 Z"
          fill="rgba(107,39,176,0.12)"
        />
        <path
          d="M0 132 C150 190 300 56 450 128 C600 200 720 182 870 112 C1020 42 1200 72 1440 150"
          fill="none"
          stroke="rgba(107,39,176,0.35)"
          strokeWidth="2"
        />
      </motion.svg>

      <motion.svg
        className="absolute bottom-[-42px] left-[-6%] h-44 w-[112%]"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        animate={{ x: ["0%", "2%", "0%"], y: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <path
          d="M0 142 C100 118 180 86 300 126 C420 166 520 220 680 138 C840 56 930 74 1040 124 C1150 174 1280 198 1440 118 L1440 260 L0 260 Z"
          fill="rgba(107,39,176,0.18)"
        />
      </motion.svg>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
