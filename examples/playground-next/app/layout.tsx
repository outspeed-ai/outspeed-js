import type { Metadata } from "next";
import "@outspeed/react/styles.css";

export const metadata: Metadata = {
  title: "Outspeed NextJS example",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <link
        rel="icon"
        href="/favicon.svg"
        sizes="any"
        type="image/svg+xml"
      ></link>
      <body>{children}</body>
    </html>
  );
}
