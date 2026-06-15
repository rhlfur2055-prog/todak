import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 차분한 뉴트럴 + 절제된 따뜻한 포인트(세이지/연살구). 그라데이션 남발 금지.
        ivory: "#FAF8F4",
        warmgray: {
          50: "#F6F4F0",
          100: "#ECE8E1",
          200: "#D9D3C8",
          300: "#BCB4A6",
          400: "#9B9183",
          500: "#7C7264",
          600: "#62594D",
          700: "#4B433A",
          800: "#332E28",
          900: "#211D19",
        },
        sage: {
          50: "#EEF2EC",
          100: "#DCE5D7",
          300: "#A9BE9E",
          500: "#7C9A6E",
          600: "#647F58",
          700: "#4F6446",
        },
        apricot: {
          100: "#F6E3D6",
          300: "#E9BFA0",
          500: "#D99B72",
          600: "#C07F55",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
