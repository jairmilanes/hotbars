(() => {
  if (tailwind) {
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          textColor: "text-slate-600",
          container: {
            center: true,
          },
          colors: {
            primary: {
              100: '#ffe4e6',
              200: '#fecdd3',
              300: '#fda4af',
              400: '#fb7185',
              500: '#f43f5e',
              600: '#e11d48',
              700: '#be123c',
              800: '#9f1239',
              900: '#881337',
            },
          }
        }
      }
    }
  }
})()