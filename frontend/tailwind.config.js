/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Remap the 'blue' color namespace to an amber/yellow palette so
        // existing `text-blue-700`, `bg-blue-700`, gradients, etc. become
        // yellow/amber site-wide without needing to change all components.
        blue: colors.amber,
      },
    },
  },
  plugins: [],
}
