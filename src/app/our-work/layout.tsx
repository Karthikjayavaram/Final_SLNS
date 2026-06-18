import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Work - Portfolio',
  description: 'Browse the portfolio of SLNS Decorators. Discover our stunning wedding stages, birthday decorations, and premium event designs.',
  alternates: {
    canonical: '/our-work',
  }
};

export default function OurWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
