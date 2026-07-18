export const metadata = {
  title: 'FlixStore',
  description: 'FlixStore e-commerce app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
