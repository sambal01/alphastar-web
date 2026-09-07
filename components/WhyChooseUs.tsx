import {
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type SVGProps
} from 'react';

type Theme = 'teal' | 'red';

type IconProps = SVGProps<SVGSVGElement>;

type Feature = {
  title: string;
  stat: string;
  statLabel: string;
  description: string;
  theme: Theme;
  Icon: ComponentType<IconProps>;
};

type FeatureCardProps = Feature;

function ShieldCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3l6 2.6v5.8c0 4.2-2.5 8-6 9.6-3.5-1.6-6-5.4-6-9.6V5.6L12 3z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 12.1l1.8 1.8 3.7-4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FriendlyStaffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M6.5 18.2c0-3.2 2.45-5.7 5.5-5.7s5.5 2.5 5.5 5.7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M12 10.8v2.1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M12 7.5v4.7l3 2.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M12 7.8v8.4M9.4 10.1c0-1.1 1.16-1.9 2.6-1.9 1.44 0 2.6.73 2.6 1.9s-1.16 1.9-2.6 1.9-2.6.83-2.6 1.95S10.56 16 12 16c1.44 0 2.6-.83 2.6-1.95"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 10.5L12 5l7 5.5V19a1 1 0 01-1 1h-3.5v-4.8h-5V20H6a1 1 0 01-1-1v-8.5z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 3.5v4M16 3.5v4M4 9.5h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES: Feature[] = [
  {
    title: 'Laboratory Testing',
    stat: 'Automated',
    statLabel: 'Lab Equipment',
    description:
      'Published services include automated blood chemistry, CBC, urinalysis, and other available laboratory tests.',
    theme: 'teal',
    Icon: ShieldCheckIcon
  },
  {
    title: 'Doctor Services',
    stat: 'Licensed',
    statLabel: 'Doctors',
    description:
      'Regular check-ups, employment requirements, vaccinations, and executive check-ups are listed among the clinic services.',
    theme: 'red',
    Icon: FriendlyStaffIcon
  },
  {
    title: 'Test-Specific Release Times',
    stat: 'Ask Staff',
    statLabel: 'Result Schedule',
    description:
      'Release schedules vary by test and processing requirements. Ask staff for the expected release time.',
    theme: 'teal',
    Icon: ClockIcon
  },
  {
    title: 'Confirm Before Visiting',
    stat: 'Current',
    statLabel: 'Prices & Promos',
    description:
      'Packages, prices, and promotions can change. Message the clinic to request current terms and availability.',
    theme: 'red',
    Icon: CoinIcon
  },
  {
    title: 'Home Service',
    stat: 'Home',
    statLabel: 'Confirm First',
    description:
      'Home service is advertised, subject to eligible services, location, fees, and schedule. Confirm details with the branch.',
    theme: 'teal',
    Icon: HomeIcon
  },
  {
    title: 'Convenient Hours',
    stat: '7',
    statLabel: 'Days/Week',
    description:
      'The regular schedule covers Monday through Sunday. Holiday closures or adjusted hours should be confirmed in advance.',
    theme: 'red',
    Icon: CalendarIcon
  }
];

function scrollToSection(id: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function FeatureCard({ title, stat, statLabel, description, theme, Icon }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setSpotPos({ x, y });
  }

  const isTeal = theme === 'teal';
  const spotlight = isTeal
    ? `radial-gradient(220px circle at ${spotPos.x}% ${spotPos.y}%, rgba(13,148,136,0.12), transparent 70%)`
    : `radial-gradient(220px circle at ${spotPos.x}% ${spotPos.y}%, rgba(220,38,38,0.12), transparent 70%)`;

  const cornerGlow = isTeal
    ? 'radial-gradient(circle at 100% 100%, rgba(13,148,136,0.12), transparent 68%)'
    : 'radial-gradient(circle at 100% 100%, rgba(220,38,38,0.12), transparent 68%)';

  const cardBorder = isHovered
    ? isTeal
      ? '#99f6e4'
      : '#fecaca'
    : '#f3f4f6';

  const cardShadow = isHovered
    ? isTeal
      ? '0 18px 36px rgba(13,148,136,0.16)'
      : '0 18px 36px rgba(220,38,38,0.14)'
    : '0 4px 16px rgba(15,23,42,0.06)';

  const iconBoxClass = isTeal
    ? isHovered
      ? 'bg-teal-100 text-teal-700 border-teal-200 scale-[1.08]'
      : 'bg-teal-50 text-teal-600 border-teal-100'
    : isHovered
      ? 'bg-red-100 text-red-600 border-red-200 scale-[1.08]'
      : 'bg-red-50 text-red-500 border-red-100';

  const titleClass = isTeal
    ? isHovered
      ? 'text-teal-700'
      : 'text-gray-800'
    : isHovered
      ? 'text-red-600'
      : 'text-gray-800';

  const statClass = isTeal ? 'text-teal-600' : 'text-red-600';
  const lineClass = isTeal
    ? 'from-teal-400 via-teal-500 to-teal-600'
    : 'from-red-300 via-red-400 to-red-500';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300"
      style={{
        borderColor: cardBorder,
        boxShadow: cardShadow,
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0px)'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: spotlight
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: cornerGlow
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-5">
        <div
          className={[
            'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border transition-all duration-300',
            iconBoxClass
          ].join(' ')}
        >
          <Icon className="h-8 w-8" />
        </div>

        <div className="grid justify-items-end gap-1 text-right">
          <strong className={['text-[1.75rem] font-extrabold leading-none', statClass].join(' ')}>{stat}</strong>
          <span className="text-xs font-medium leading-4 text-gray-400">{statLabel}</span>
        </div>
      </div>

      <h3 className={['relative z-10 mt-6 text-2xl font-bold transition-colors duration-300', titleClass].join(' ')}>
        {title}
      </h3>

      <p className="relative z-10 mt-3 text-sm leading-7 text-gray-500">{description}</p>

      <div className="relative z-10 mt-8 h-1 overflow-hidden rounded-full">
        <div
          className={['h-full rounded-full bg-gradient-to-r transition-all duration-500', lineClass].join(' ')}
          style={{ width: isHovered ? '100%' : '0%' }}
        />
      </div>
    </div>
  );
}

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Why Patients <span className="text-red-600">Choose</span> Us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            We combine medical excellence with genuine care - because your health and peace of mind matter to us.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-white shadow-xl lg:p-12">
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-teal-500/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-14 h-52 w-52 rounded-full bg-teal-800/35 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold text-white">Planning a clinic visit?</h3>
              <p className="mt-3 text-lg text-teal-100">
                Request an appointment or confirm walk-in and provider availability first.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-teal-700 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Request Appointment
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('services')}
                className="inline-flex items-center justify-center rounded-full border-2 border-white px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-teal-700"
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
