import './globals.css';

export const metadata = {
  title: 'Chacha Prime Admin',
  description: 'Chacha Prime operations dashboard',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
