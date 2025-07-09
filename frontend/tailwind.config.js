/** @type {import('tailwindcss').Config} */
module.exports = {
  // This is the MOST IMPORTANT part for a small, optimized CSS file
  // It tells Tailwind to scan these files for CSS classes to include in the output.
  content: [
    "./index.html", // Scan your HTML file
    // If you add any JavaScript files that dynamically add Tailwind classes,
    // you'd list them here too, e.g., "./js/**/*.js",
  ],
  theme: {
    extend: {
      // You've specified Poppins in your HTML,
      // you can make it the default Tailwind font here:
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      // You can extend other theme properties like colors, spacing, etc.
      // Example:
      // colors: {
      //   'custom-blue': '#1a2b3c',
      // },
    },
  },
  // Enable class-based dark mode
  darkMode: 'class', // Make sure this is enabled for dark: classes to work
  plugins: [],
};