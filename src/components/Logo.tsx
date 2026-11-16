// Arma logosu: appicon/appicon.jpg'deki işaretin vektör çizimi. Rengi currentColor'dan alır.

const MARK_PATHS = [
  'M455 714H545L738 1010A430 430 0 0 0 610 953L499 782L387 958A430 430 0 0 0 253 1025Z',
  'M127 1220A409.6 409.6 0 0 1 888 1220H770L655 1040A327.8 327.8 0 0 0 245 1220Z',
];

const WORD_PATHS = [
  'M612 714H750C830 714 875 762 875 835C875 872 852 891 810 897L897 1020H838L725 865H778C806 865 822 846 822 812C822 778 804 757 768 757H642Z',
  'M930 714H988L1145 911L1297 714H1357V1020H1272V822L1157 972H1137L1015 822V1020H930Z',
  'M1590 714H1613L1801 1020H1737L1603 795L1468 1020H1407Z',
];

interface LogoProps {
  variant?: 'full' | 'mark';
  className?: string;
  title?: string;
}

export function Logo({ variant = 'full', className, title = 'Arma' }: LogoProps) {
  const paths = variant === 'full' ? [...MARK_PATHS, ...WORD_PATHS] : MARK_PATHS;
  const viewBox = variant === 'full' ? '120 705 1690 525' : '117 704 781 526';
  return (
    <svg className={className} viewBox={viewBox} role="img" aria-label={title} fill="currentColor">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
