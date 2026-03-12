export const metadata = {
  title: "French.Super — Финансовая модель",
  description: "Интерактивный калькулятор юнит-экономики школы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
