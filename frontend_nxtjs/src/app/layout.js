import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AI Video Creator Pro",
  description: "Pro Studio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
