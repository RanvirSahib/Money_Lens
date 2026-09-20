export const netWorthSeries = [
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
  { month: "Jul", value: 0 },
  { month: "Aug", value: 0 },
  { month: "Sep", value: 0 },
];

export const cashflowSeries = [
  { month: "Apr", income: 9400, spending: 6120 },
  { month: "May", income: 9400, spending: 6890 },
  { month: "Jun", income: 10250, spending: 7240 },
  { month: "Jul", income: 9400, spending: 5880 },
  { month: "Aug", income: 9800, spending: 6410 },
  { month: "Sep", income: 9400, spending: 5960 },
];

export const spendingBreakdown = [
  { category: "Housing", amount: 2400, tone: "chart-1" },
  { category: "Food & dining", amount: 1180, tone: "chart-2" },
  { category: "Transport", amount: 640, tone: "chart-3" },
  { category: "Subscriptions", amount: 310, tone: "chart-4" },
  { category: "Everything else", amount: 1430, tone: "chart-5" },
];

export const healthRadar = [
  { axis: "Savings", score: 84 },
  { axis: "Spending", score: 71 },
  { axis: "Debt", score: 92 },
  { axis: "Liquidity", score: 66 },
  { axis: "Growth", score: 78 },
  { axis: "Protection", score: 58 },
];

export const goals = [
  { name: "Emergency fund", current: 18400, target: 24000, state: "positive" as const },
  { name: "Tokyo, April", current: 3100, target: 6500, state: "info" as const },
  { name: "Home deposit", current: 41200, target: 120000, state: "attention" as const },
];

export const insights = [
  {
    tone: "attention" as const,
    title: "Subscriptions crept up 18%",
    body: "Three renewals landed in the same week. Cancelling the two unused ones frees $34 a month.",
  },
  {
    tone: "info" as const,
    title: "Cash is sitting idle",
    body: "$12,800 above your buffer earns 0.1%. Moving it to your savings account adds ~$540 a year.",
  },
  {
    tone: "positive" as const,
    title: "Savings rate is holding at 37%",
    body: "Six months above target. At this pace your emergency fund completes in February.",
  },
];

export const simulations = [
  { label: "Buy a ₹40L flat in 2027", delta: "-₹18,000 / mo EMI", tone: "risk" as const },
  { label: "Start SIP of ₹10,000/mo", delta: "+₹23L in 10 yrs", tone: "positive" as const },
  { label: "Car purchase ₹8L lump sum", delta: "-8 months runway", tone: "attention" as const },
];

export const transactions = [
  { name: "Whole Foods Market", category: "Food & dining", date: "Sep 18", amount: -142.6 },
  { name: "Payroll — Northwind", category: "Income", date: "Sep 15", amount: 4700 },
  { name: "Bay Area Rapid Transit", category: "Transport", date: "Sep 15", amount: -28.5 },
  { name: "Vanguard transfer", category: "Investing", date: "Sep 14", amount: -1500 },
  { name: "Aurora Coffee", category: "Food & dining", date: "Sep 13", amount: -6.75 },
];

export const currency = (value: number, fractions = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractions,
    maximumFractionDigits: fractions,
  }).format(value);

export const accounts = [
  { name: "Everyday checking", institution: "Northwind Bank", type: "Cash", balance: 12840, change: 1.2, tone: "info" as const },
  { name: "High-yield savings", institution: "Northwind Bank", type: "Cash", balance: 25580, change: 3.9, tone: "positive" as const },
  { name: "Brokerage", institution: "Vanguard", type: "Investments", balance: 148300, change: 4.6, tone: "positive" as const },
  { name: "Retirement 401(k)", institution: "Fidelity", type: "Investments", balance: 74210, change: 2.8, tone: "positive" as const },
  { name: "Travel card", institution: "Aurora Card", type: "Credit", balance: -2140, change: -8.4, tone: "attention" as const },
  { name: "Student loan", institution: "Meridian", type: "Debt", balance: -17140, change: -2.1, tone: "risk" as const },
];

export const merchants = [
  { name: "Blue Harbor Rentals", category: "Housing", amount: 2400, visits: 1 },
  { name: "Whole Foods Market", category: "Food & dining", amount: 486, visits: 6 },
  { name: "Aurora Coffee", category: "Food & dining", amount: 128, visits: 19 },
  { name: "Bay Area Rapid Transit", category: "Transport", amount: 214, visits: 22 },
  { name: "Lyft", category: "Transport", amount: 186, visits: 9 },
  { name: "Streaming bundle", category: "Subscriptions", amount: 94, visits: 4 },
];

export const subscriptions = [
  { name: "Cloud storage", cadence: "Monthly", amount: 11.99, status: "Used weekly", tone: "positive" as const },
  { name: "Fitness app", cadence: "Monthly", amount: 24.0, status: "Unused for 3 months", tone: "attention" as const },
  { name: "News bundle", cadence: "Annual", amount: 120.0, status: "Renews Oct 4", tone: "info" as const },
  { name: "Design suite", cadence: "Monthly", amount: 59.99, status: "Unused for 2 months", tone: "risk" as const },
];

export const goalDetails = [
  {
    name: "Emergency fund",
    current: 18400,
    target: 24000,
    state: "positive" as const,
    monthly: 700,
    eta: "February 2027",
    note: "Six months of essential spending. On pace and fully liquid.",
  },
  {
    name: "Tokyo, April",
    current: 3100,
    target: 6500,
    state: "info" as const,
    monthly: 480,
    eta: "March 2027",
    note: "Flights are the biggest line. Booking by December saves about $310.",
  },
  {
    name: "Home deposit",
    current: 41200,
    target: 120000,
    state: "attention" as const,
    monthly: 1600,
    eta: "August 2030",
    note: "Slower than plan. An extra $400 a month pulls this into 2029.",
  },
];

export const scenarios = [
  {
    label: "Buy the apartment in 2028",
    delta: "-$860 / mo",
    tone: "risk" as const,
    summary: "A $520k purchase with 20% down. Cashflow stays positive but the buffer thins.",
    effects: [
      { label: "Monthly cashflow", value: "-$860" },
      { label: "Emergency buffer", value: "2.1 months" },
      { label: "Net worth by 2035", value: "+$182k" },
    ],
  },
  {
    label: "Switch to the 4-day week",
    delta: "-$1,420 / mo",
    tone: "attention" as const,
    summary: "A 20% income cut. Goals slip but the emergency fund still completes in 2027.",
    effects: [
      { label: "Monthly cashflow", value: "+$1,160" },
      { label: "Savings rate", value: "19%" },
      { label: "Home deposit ETA", value: "2033" },
    ],
  },
  {
    label: "Max the retirement match",
    delta: "+$96k by 2045",
    tone: "positive" as const,
    summary: "Raising contributions to 12% captures the full employer match.",
    effects: [
      { label: "Monthly cashflow", value: "-$310" },
      { label: "Tax saved / yr", value: "$1,480" },
      { label: "Net worth by 2045", value: "+$96k" },
    ],
  },
];

export const insightFeed = [
  {
    tone: "attention" as const,
    title: "Subscriptions crept up 18%",
    body: "Three renewals landed in the same week. Cancelling the two unused ones frees $34 a month.",
    impact: "+$408 / yr",
    date: "Sep 18",
  },
  {
    tone: "info" as const,
    title: "Cash is sitting idle",
    body: "$12,800 above your buffer earns 0.1%. Moving it to your savings account adds about $540 a year.",
    impact: "+$540 / yr",
    date: "Sep 16",
  },
  {
    tone: "positive" as const,
    title: "Savings rate is holding at 37%",
    body: "Six months above target. At this pace your emergency fund completes in February.",
    impact: "On track",
    date: "Sep 12",
  },
  {
    tone: "risk" as const,
    title: "Travel card balance is revolving",
    body: "$2,140 carried at 21.9% APR. Clearing it from savings saves more than the savings earn.",
    impact: "+$468 / yr",
    date: "Sep 9",
  },
  {
    tone: "info" as const,
    title: "Grocery spend is seasonal",
    body: "Food spend rises about 12% each quarter-end. Budgeting $1,320 for December avoids the overshoot.",
    impact: "Planning",
    date: "Sep 4",
  },
];
