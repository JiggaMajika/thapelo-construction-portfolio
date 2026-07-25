// Seed source data. The eight real vendors are publicly documented lifetime-deal
// cases, seeded for client demonstration only (is_demo_record = true).
import type {
  FailureMode,
  MonitoringGroup,
  PromiseStatus,
  PromiseSourceType,
  Severity,
  BoardStage,
  VendorStatus,
} from '@shared/types';

export interface SeedPromise {
  text: string;
  source: PromiseSourceType;
  status: PromiseStatus;
  promisedOn?: string;
  dueBy?: string;
}
export interface SeedIssue {
  title: string;
  description?: string;
  failureMode: FailureMode;
  severity: Severity;
  stage: BoardStage;
  team?: 'gmc' | 'partnerships' | 'support' | 'finance' | 'leadership';
  resolutionNote?: string;
}
export interface SeedQuestion {
  text: string;
  askedOn: string;
  days: number;
}
export interface SeedVendor {
  name: string;
  company?: string;
  founder?: string;
  status: VendorStatus;
  score: number;
  group: MonitoringGroup;
  failureMode?: FailureMode;
  demo?: boolean;
  archived?: boolean;
  badge?: 'none' | 'bronze' | 'silver' | 'gold';
  launchDate?: string;
  tierCount?: number;
  priceRange?: string;
  dealUrl?: string;
  appUrl?: string;
  changelogUrl?: string;
  supportEmail?: string;
  // scoreArc: 12 monthly-ish points, oldest first, used to build history.
  scoreArc: number[];
  sliding?: boolean; // green but sliding 15+ in 30d
  promises: SeedPromise[];
  issues: SeedIssue[];
  questions?: SeedQuestion[];
  complaintThemes?: { theme: string; sample: string }[];
}

// Helper to build a 12-point arc between anchors.
function arc(points: number[]): number[] {
  return points;
}

export const DEMO_VENDORS: SeedVendor[] = [
  {
    name: 'Yapper',
    company: 'Yapper AI',
    founder: 'Undisclosed',
    status: 'red',
    score: 21,
    group: 'A',
    failureMode: 'paid_twice',
    demo: true,
    badge: 'none',
    launchDate: '2024-02-10',
    tierCount: 3,
    priceRange: '$59–$249',
    scoreArc: arc([74, 76, 75, 73, 72, 70, 68, 66, 55, 42, 30, 21]),
    promises: [
      { text: 'Lifetime Creator plan with 15,000 monthly credits', source: 'deal_page', status: 'broken', promisedOn: '2024-02-10' },
      { text: 'Automatic monthly credit refills for the life of the account', source: 'deal_page', status: 'broken', promisedOn: '2024-02-10' },
      { text: 'Named premium model access included at no extra cost', source: 'deal_page', status: 'broken', promisedOn: '2024-02-10' },
      { text: 'All future plan upgrades included for lifetime buyers', source: 'terms', status: 'broken', promisedOn: '2024-02-10' },
      { text: 'Priority email support for lifetime accounts', source: 'deal_page', status: 'overdue', promisedOn: '2024-02-10' },
    ],
    issues: [
      { title: 'Monthly refills silently converted to one-time credit pack', failureMode: 'paid_twice', severity: 'serious', stage: 'resolved', team: 'gmc', resolutionNote: 'Confirmed conversion; escalated to AppSumo, formal notice issued to vendor.' },
      { title: 'Premium model access removed for lifetime buyers', failureMode: 'paid_twice', severity: 'serious', stage: 'with_appsumo', team: 'partnerships' },
    ],
    questions: [
      { text: 'Is this genuinely a lifetime deal, or a fixed credit allocation?', askedOn: '2024-08-02', days: 92 },
      { text: 'What is the withdrawal / clawback clause on purchased credits?', askedOn: '2024-08-05', days: 89 },
      { text: 'Does the founder have prior business-continuity history?', askedOn: '2024-08-11', days: 83 },
    ],
    complaintThemes: [
      { theme: 'Credits disappeared', sample: 'My 15k monthly credits are just gone, now it says one-time pack.' },
      { theme: 'Premium models locked', sample: 'The model I bought this for is now behind another paywall.' },
    ],
  },
  {
    name: 'Qolaba',
    company: 'Qolaba',
    status: 'green',
    score: 82,
    group: 'B',
    failureMode: 'limit_creep',
    demo: true,
    badge: 'silver',
    launchDate: '2023-11-01',
    tierCount: 3,
    priceRange: '$69–$249',
    scoreArc: arc([80, 81, 80, 79, 66, 58, 62, 70, 76, 80, 82, 82]),
    promises: [
      { text: 'No usage limits imposed on lifetime accounts', source: 'founder_email', status: 'delivered', promisedOn: '2023-11-01' },
      { text: 'Access to all models added during the lifetime period', source: 'deal_page', status: 'delivered' },
      { text: 'Roadmap features shipped to LTD buyers first', source: 'roadmap', status: 'in_progress' },
    ],
    issues: [
      { title: 'Announced monthly limits later confirmed unchanged for LTD users', failureMode: 'limit_creep', severity: 'notable', stage: 'resolved', team: 'partnerships', resolutionNote: 'AppSumo intervened; vendor confirmed in writing no change for lifetime users. Buyers notified.' },
    ],
    complaintThemes: [
      { theme: 'Limit announcement panic', sample: 'Saw the limits notice and thought my LTD was toast — turned out fine.' },
    ],
  },
  {
    name: 'JoggAI',
    company: 'JoggAI',
    status: 'amber',
    score: 54,
    group: 'A',
    failureMode: 'limit_creep',
    demo: true,
    badge: 'none',
    launchDate: '2024-01-15',
    tierCount: 5,
    priceRange: '$49–$399',
    scoreArc: arc([72, 70, 68, 66, 64, 60, 58, 56, 55, 54, 54, 54]),
    promises: [
      { text: 'Credits for top-tier models included in deal comments', source: 'qa_comment', status: 'broken' },
      { text: 'No bring-your-own-key requirement for premium models', source: 'qa_comment', status: 'broken' },
      { text: 'Unlimited video generations within fair use', source: 'deal_page', status: 'overdue' },
      { text: 'Full voice library access for all LTD tiers', source: 'deal_page', status: 'in_progress' },
      { text: 'Weekly product updates for LTD buyers', source: 'roadmap', status: 'in_progress' },
      { text: 'Commercial usage rights included', source: 'terms', status: 'delivered' },
    ],
    issues: [
      { title: 'Top models moved to bring-your-own-key after sale', failureMode: 'limit_creep', severity: 'serious', stage: 'confirmed', team: 'gmc' },
      { title: 'Weekly caps introduced post-sale without notice', failureMode: 'limit_creep', severity: 'notable', stage: 'with_appsumo', team: 'partnerships' },
    ],
    questions: [
      { text: 'Which specific models now require a personal API key?', askedOn: '2024-05-20', days: 66 },
      { text: 'Is the weekly cap permanent or a temporary measure?', askedOn: '2024-06-01', days: 54 },
    ],
    complaintThemes: [
      { theme: 'BYOK now required', sample: 'I have to bring my own OpenAI key now, that was included before.' },
      { theme: 'Weekly caps', sample: 'Hit a weekly cap that never existed when I bought.' },
      { theme: 'Voice access shrunk', sample: 'Half the voices I used are now premium-only.' },
    ],
  },
  {
    name: 'Pickaxe',
    company: 'Pickaxe',
    status: 'amber',
    score: 58,
    group: 'B',
    failureMode: 'paid_twice',
    demo: true,
    badge: 'none',
    launchDate: '2023-09-20',
    tierCount: 4,
    priceRange: '$59–$299',
    scoreArc: arc([70, 69, 67, 66, 64, 63, 61, 60, 59, 58, 58, 58]),
    promises: [
      { text: 'Features available at purchase remain in the lifetime plan', source: 'deal_page', status: 'broken' },
      { text: 'API access included with the lifetime plan', source: 'deal_page', status: 'broken' },
      { text: 'Unlimited studios for LTD buyers', source: 'terms', status: 'delivered' },
      { text: 'Custom branding on all tiers', source: 'deal_page', status: 'in_progress' },
    ],
    issues: [
      { title: 'Purchase-era features moved behind new paid tiers', failureMode: 'paid_twice', severity: 'notable', stage: 'confirmed', team: 'gmc' },
    ],
    complaintThemes: [
      { theme: 'API restricted', sample: 'API access I paid for is blocked on AppSumo accounts.' },
    ],
  },
  {
    name: 'ContentGroove',
    company: 'ContentGroove',
    status: 'red',
    score: 8,
    group: 'A',
    failureMode: 'bad_exit',
    demo: true,
    archived: true,
    badge: 'none',
    launchDate: '2023-03-01',
    tierCount: 3,
    priceRange: '$49–$199',
    scoreArc: arc([60, 58, 55, 50, 45, 40, 33, 28, 20, 14, 10, 8]),
    promises: [
      { text: 'Lifetime access to the video repurposing suite', source: 'deal_page', status: 'broken' },
      { text: 'Ongoing product support and updates', source: 'terms', status: 'broken' },
    ],
    issues: [
      { title: 'Shut down ~14 months after sale, no notice, no credit, no replacement', failureMode: 'bad_exit', severity: 'serious', stage: 'resolved', team: 'leadership', resolutionNote: 'Confirmed shutdown. Recorded as bad exit; buyer-protection recommendation logged.' },
    ],
  },
  {
    name: 'Cosmos Video',
    company: 'Cosmos Video',
    status: 'red',
    score: 15,
    group: 'A',
    failureMode: 'bad_exit',
    demo: true,
    badge: 'none',
    launchDate: '2023-06-12',
    tierCount: 3,
    priceRange: '$59–$249',
    scoreArc: arc([62, 60, 57, 52, 47, 42, 36, 30, 25, 20, 17, 15]),
    promises: [
      { text: 'Lifetime plan honoured for the life of the product', source: 'deal_page', status: 'broken' },
      { text: 'Full feature access with no future paywalls', source: 'deal_page', status: 'broken' },
    ],
    issues: [
      { title: 'Lifetime plans cancelled; discount coupon offered as remedy', failureMode: 'bad_exit', severity: 'serious', stage: 'awaiting_vendor', team: 'partnerships' },
    ],
    questions: [
      { text: 'Why was a coupon offered instead of honouring the lifetime plan?', askedOn: '2024-04-10', days: 106 },
    ],
    complaintThemes: [
      { theme: 'Plan cancelled', sample: 'They cancelled my lifetime plan and offered a coupon. A coupon!' },
    ],
  },
  {
    name: 'Adilo',
    company: 'Adilo',
    status: 'red',
    score: 24,
    group: 'B',
    failureMode: 'paid_twice',
    demo: true,
    badge: 'none',
    launchDate: '2022-11-05',
    tierCount: 4,
    priceRange: '$69–$399',
    scoreArc: arc([58, 55, 52, 50, 47, 44, 40, 36, 33, 30, 27, 24]),
    promises: [
      { text: 'Lifetime plan not subject to cancellation', source: 'terms', status: 'broken' },
      { text: 'Bandwidth allowance as advertised at purchase', source: 'deal_page', status: 'broken' },
      { text: 'No forced migration to paid subscriptions', source: 'deal_page', status: 'broken' },
    ],
    issues: [
      { title: 'Continued cancelling paid lifetime plans after buyer advocacy', failureMode: 'paid_twice', severity: 'serious', stage: 'vendor_contacted', team: 'partnerships' },
    ],
    questions: [
      { text: 'On what basis are paid lifetime plans being cancelled?', askedOn: '2024-03-15', days: 132 },
    ],
    complaintThemes: [
      { theme: 'Forced to subscribe', sample: 'My lifetime plan was cancelled and I was pushed to a monthly sub.' },
    ],
  },
  {
    name: 'Pictory',
    company: 'Pictory AI',
    status: 'amber',
    score: 61,
    group: 'B',
    failureMode: 'limit_creep',
    demo: true,
    badge: 'bronze',
    launchDate: '2022-08-01',
    tierCount: 3,
    priceRange: '$99–$399',
    scoreArc: arc([72, 71, 70, 68, 67, 66, 65, 64, 63, 62, 61, 61]),
    promises: [
      { text: 'Lifetime accounts remain active', source: 'deal_page', status: 'delivered' },
      { text: 'Feature set as it existed at purchase preserved', source: 'terms', status: 'delivered' },
      { text: 'New AI features added for lifetime buyers', source: 'roadmap', status: 'broken' },
      { text: 'Increased video length limits over time', source: 'roadmap', status: 'overdue' },
    ],
    issues: [
      { title: 'Lifetime accounts frozen at purchase-era feature set', failureMode: 'limit_creep', severity: 'notable', stage: 'awaiting_vendor', team: 'partnerships' },
    ],
    complaintThemes: [
      { theme: 'No new features', sample: 'Everyone else gets the new AI tools, my LTD is frozen in time.' },
    ],
  },
];

// Fictional filler — invented names that cannot be mistaken for real products.
const FICTIONAL_NAMES = [
  'Northwind Analytics',
  'Kestrel Forms',
  'Larkspur CRM',
  'Tindal Mail',
  'Vellum Docs',
  'Ridgeway Scheduler',
  'Copperleaf Invoicing',
  'Marlow Surveys',
  'Ashfield Helpdesk',
  'Brightwater Sites',
  'Fernbrook Signatures',
  'Halcyon Notes',
  'Windrow Timesheets',
  'Peregrine Dashboards',
];

function makeArc(base: number, status: VendorStatus, sliding: boolean): number[] {
  const out: number[] = [];
  let v = base + (status === 'green' ? -4 : status === 'amber' ? 4 : 8);
  for (let i = 0; i < 12; i++) {
    out.push(Math.max(2, Math.min(98, Math.round(v))));
    // gentle drift toward base
    v += (base - v) * 0.3 + (Math.sin(i) * 2);
  }
  out[11] = base;
  if (sliding) {
    // strong drop in the last 30 days (last 1-2 points) but still green
    out[9] = base + 18;
    out[10] = base + 10;
    out[11] = base;
  }
  return out;
}

const FICTIONAL_PROMISE_TEXTS: SeedPromise[] = [
  { text: 'Lifetime access to all current features', source: 'deal_page', status: 'delivered' },
  { text: 'Unlimited seats for the team plan', source: 'deal_page', status: 'delivered' },
  { text: 'Quarterly feature updates for LTD buyers', source: 'roadmap', status: 'in_progress' },
  { text: 'Priority support response within 24 hours', source: 'terms', status: 'delivered' },
  { text: 'API access included on all tiers', source: 'deal_page', status: 'promised' },
  { text: 'Data export available at any time', source: 'terms', status: 'delivered' },
  { text: 'No per-seat pricing introduced later', source: 'founder_email', status: 'promised' },
];

export function buildFictionalVendors(): SeedVendor[] {
  // Distribution across 22 total incl. 8 demo: need ~12 green, 6 amber, 4 red.
  // Demo set: green 1 (Qolaba), amber 3 (JoggAI, Pickaxe, Pictory), red 4 (Yapper, ContentGroove, Cosmos, Adilo).
  // So fictional (14): green 11, amber 3, red 0.
  const plan: { status: VendorStatus; score: number }[] = [
    { status: 'green', score: 88 },
    { status: 'green', score: 85 },
    { status: 'green', score: 91 },
    { status: 'green', score: 79 }, // sliding candidate 1
    { status: 'green', score: 77 }, // sliding candidate 2
    { status: 'green', score: 83 },
    { status: 'green', score: 86 },
    { status: 'green', score: 80 },
    { status: 'green', score: 90 },
    { status: 'green', score: 84 },
    { status: 'green', score: 82 },
    { status: 'amber', score: 56 },
    { status: 'amber', score: 62 },
    { status: 'amber', score: 49 },
  ];
  const groups: MonitoringGroup[] = ['A', 'B', 'C'];
  const badges: ('none' | 'bronze' | 'silver' | 'gold')[] = ['none', 'bronze', 'silver', 'gold'];

  return FICTIONAL_NAMES.map((name, i) => {
    const p = plan[i];
    const sliding = i === 3 || i === 4; // two sliding green vendors
    const promiseCount = 4 + (i % 5); // 4..8
    const promises = FICTIONAL_PROMISE_TEXTS.slice(0, promiseCount).map((pr, j) => ({
      ...pr,
      // sprinkle broken promises among amber
      status: (p.status === 'amber' && j === 0 ? 'broken' : pr.status) as PromiseStatus,
    }));
    const issues: SeedIssue[] =
      p.status === 'amber'
        ? [
            {
              title: `${name}: usage limit change reported by buyers`,
              failureMode: 'limit_creep',
              severity: 'notable',
              stage: (['spotted', 'confirmed', 'awaiting_vendor'] as BoardStage[])[i % 3],
              team: 'partnerships',
            },
          ]
        : [];
    return {
      name,
      company: name,
      status: p.status,
      score: p.score,
      group: groups[i % 3],
      badge: p.status === 'green' ? badges[(i % 3) + 1] : 'none',
      launchDate: `2023-0${(i % 9) + 1}-05`,
      tierCount: 3 + (i % 3),
      priceRange: '$49–$249',
      scoreArc: makeArc(p.score, p.status, sliding),
      sliding,
      promises,
      issues,
      complaintThemes:
        p.status === 'amber'
          ? [{ theme: 'Limit change', sample: 'Noticed a new cap on my plan.' }]
          : [],
    };
  });
}

export const ALL_SEED_VENDORS: SeedVendor[] = [
  ...DEMO_VENDORS,
  ...buildFictionalVendors(),
];
