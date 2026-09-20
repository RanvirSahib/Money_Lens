import type {
  ComparisonPoint,
  DashboardResponse,
  ExperimentRequest,
  ExperimentResult,
  Goal,
  GoalCreateRequest,
  ProjectionPoint,
  RadarResponse,
  ReverseRequest,
  ReverseResult,
  SimulationRequest,
  SimulationResult,
} from "@/types/finance";

const demoProjection: ProjectionPoint[] = [
  { month: "Oct", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 70000, cashFlowStatus: "healthy" },
  { month: "Nov", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 100000, milestone: "Emergency fund reaches target", cashFlowStatus: "healthy" },
  { month: "Dec", income: 55000, expenses: 31000, additionalPayment: 0, savings: 24000, balance: 124000, cashFlowStatus: "watch" },
  { month: "Jan", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 154000, cashFlowStatus: "healthy" },
  { month: "Feb", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 184000, cashFlowStatus: "healthy" },
  { month: "Mar", income: 55000, expenses: 28000, additionalPayment: 0, savings: 27000, balance: 211000, cashFlowStatus: "healthy" },
  { month: "Apr", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 241000, cashFlowStatus: "healthy" },
  { month: "May", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 271000, cashFlowStatus: "healthy" },
  { month: "Jun", income: 55000, expenses: 30000, additionalPayment: 0, savings: 25000, balance: 296000, milestone: "Travel goal reviewed", cashFlowStatus: "watch" },
  { month: "Jul", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 326000, cashFlowStatus: "healthy" },
  { month: "Aug", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 356000, cashFlowStatus: "healthy" },
  { month: "Sep", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 386000, cashFlowStatus: "healthy" },
];

const phoneProjection: ProjectionPoint[] = [
  { month: "Oct", income: 55000, expenses: 25000, additionalPayment: 80000, savings: -50000, balance: -10000, milestone: "Phone purchase", cashFlowStatus: "pressure" },
  { month: "Nov", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 20000, cashFlowStatus: "watch" },
  { month: "Dec", income: 55000, expenses: 31000, additionalPayment: 0, savings: 24000, balance: 44000, cashFlowStatus: "watch" },
  { month: "Jan", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 74000, cashFlowStatus: "healthy" },
  { month: "Feb", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 104000, cashFlowStatus: "healthy" },
  { month: "Mar", income: 55000, expenses: 28000, additionalPayment: 0, savings: 27000, balance: 131000, cashFlowStatus: "healthy" },
  { month: "Apr", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 161000, cashFlowStatus: "healthy" },
  { month: "May", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 191000, cashFlowStatus: "healthy" },
  { month: "Jun", income: 55000, expenses: 30000, additionalPayment: 0, savings: 25000, balance: 216000, cashFlowStatus: "watch" },
  { month: "Jul", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 246000, cashFlowStatus: "healthy" },
  { month: "Aug", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 276000, cashFlowStatus: "healthy" },
  { month: "Sep", income: 55000, expenses: 25000, additionalPayment: 0, savings: 30000, balance: 306000, cashFlowStatus: "healthy" },
];

const comparison: ComparisonPoint[] = [
  { month: "Oct", buyNow: -10000, emi: 63333, saveFirst: 70000 },
  { month: "Nov", buyNow: 20000, emi: 86666, saveFirst: 100000 },
  { month: "Dec", buyNow: 44000, emi: 103999, saveFirst: 124000 },
  { month: "Jan", buyNow: 74000, emi: 127332, saveFirst: 74000 },
  { month: "Feb", buyNow: 104000, emi: 150665, saveFirst: 104000 },
  { month: "Mar", buyNow: 131000, emi: 171998, saveFirst: 131000 },
  { month: "Apr", buyNow: 161000, emi: 195331, saveFirst: 161000 },
  { month: "May", buyNow: 191000, emi: 218664, saveFirst: 191000 },
  { month: "Jun", buyNow: 216000, emi: 236997, saveFirst: 216000 },
  { month: "Jul", buyNow: 246000, emi: 260330, saveFirst: 246000 },
  { month: "Aug", buyNow: 276000, emi: 283663, saveFirst: 276000 },
  { month: "Sep", buyNow: 306000, emi: 306996, saveFirst: 306000 },
];

const goals: Goal[] = [
  {
    id: "emergency-fund",
    name: "Emergency Fund",
    targetAmount: 100000,
    currentAmount: 40000,
    targetDate: "2027-06-01",
    progressPercent: 40,
    requiredMonthlyContribution: 7500,
    status: "on_track",
    possibleImpact: "Phone purchase scenarios may shift this goal by 1–3 months.",
  },
  {
    id: "learning-fund",
    name: "Learning Fund",
    targetAmount: 60000,
    currentAmount: 22000,
    targetDate: "2027-03-01",
    progressPercent: 37,
    requiredMonthlyContribution: 6500,
    status: "attention",
    possibleImpact: "A bonus month may bring this target back within range.",
  },
];

const radarEvents = [
  {
    id: "rent",
    date: "2026-09-23",
    description: "Rent",
    amount: 15000,
    category: "Housing",
    type: "expense" as const,
    status: "Potential cash-flow pressure",
    severity: "warning" as const,
    daysAway: 5,
  },
  {
    id: "salary",
    date: "2026-09-26",
    description: "Salary expected",
    amount: 55000,
    category: "Income",
    type: "income" as const,
    status: "Expected income",
    severity: "positive" as const,
    daysAway: 8,
  },
  {
    id: "subscriptions",
    date: "2026-09-26",
    description: "Subscriptions",
    amount: 1899,
    category: "Recurring",
    type: "expense" as const,
    status: "Recurring payment",
    severity: "neutral" as const,
    daysAway: 8,
  },
  {
    id: "insurance",
    date: "2026-10-05",
    description: "Health insurance premium",
    amount: 9200,
    category: "Insurance",
    type: "expense" as const,
    status: "Upcoming expense",
    severity: "warning" as const,
    daysAway: 17,
  },
];

const transactions = [
  { id: "t1", date: "2026-09-17", description: "Monthly salary", merchant: "Employer", category: "Income", amount: 55000, type: "income" as const },
  { id: "t2", date: "2026-09-12", description: "Apartment rent", merchant: "Landlord", category: "Housing", amount: 15000, type: "expense" as const },
  { id: "t3", date: "2026-09-10", description: "Groceries", merchant: "Supermarket", category: "Essentials", amount: 4200, type: "expense" as const },
  { id: "t4", date: "2026-09-08", description: "Learning subscription", merchant: "Course platform", category: "Education", amount: 1899, type: "expense" as const },
];

function delay<T>(payload: T, ms = 320): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(payload), ms);
  });
}

export function mockDashboard(): Promise<DashboardResponse> {
  return delay({
    greeting: "Good evening.",
    summary: {
      currentSavings: 40000,
      monthlyIncome: 55000,
      monthlyExpenses: 25000,
      activeGoals: 2,
      sampleDataLabel: "Sample profile",
    },
    projection: demoProjection,
    quickInsights: [
      "Projected balance stays above your current savings baseline in the default scenario.",
      "December shows a possible expense spike that may reduce monthly flexibility.",
      "Emergency fund progress appears steady in the current sample plan.",
    ],
    goals,
    radar: radarEvents,
    transactions,
  });
}

export function mockSimulation(request?: SimulationRequest): Promise<SimulationResult> {
  return delay({
    id: "sim-phone-80000",
    inputSummary: request?.prompt || "I want to buy an ₹80,000 phone.",
    metrics: [
      { label: "Monthly impact", value: "₹6,667 EMI scenario", helper: "Estimated backend value for the 12-month example.", tone: "warning" },
      { label: "Lowest projected balance", value: "-₹10,000", helper: "Potential dip in the buy-now path.", tone: "danger" },
      { label: "Projected savings", value: "₹3,06,000", helper: "Possible 12-month balance in the direct purchase scenario.", tone: "neutral" },
      { label: "Potential goal impact", value: "1–3 month delay", helper: "Scenario-dependent effect on active goals.", tone: "warning" },
    ],
    projection: phoneProjection,
    comparison,
    scenarios: [
      {
        id: "buy-now",
        type: "buy_now",
        title: "Buy Now",
        description: "Immediate purchase creates the sharpest short-term cash-flow pressure.",
        projectedBalance: 306000,
        lowestProjectedBalance: -10000,
        monthlyImpact: "One-time ₹80,000 outflow",
        goalImpact: "Potential 3-month goal delay",
        timeline: "Purchase today",
        tone: "danger",
      },
      {
        id: "emi",
        type: "emi",
        title: "EMI",
        description: "Spreads the cost but reduces monthly flexibility for the full term.",
        projectedBalance: 306996,
        lowestProjectedBalance: 63333,
        monthlyImpact: "Estimated ₹6,667 per month",
        goalImpact: "Potential 1-month goal delay",
        timeline: "12 monthly payments",
        tone: "warning",
      },
      {
        id: "save-first",
        type: "save_first",
        title: "Save First",
        description: "Delays purchase while preserving a stronger near-term buffer.",
        projectedBalance: 306000,
        lowestProjectedBalance: 70000,
        monthlyImpact: "No financing pressure",
        goalImpact: "Goal remains closer to plan",
        timeline: "Possible purchase after 3 months",
        tone: "positive",
      },
    ],
    insight:
      "This simulation compares possible futures instead of choosing for you. The EMI path appears smoother early, while save-first preserves the strongest buffer before purchase.",
  });
}

export function mockGoals(): Promise<Goal[]> {
  return delay(goals);
}

export function mockCreateGoal(goal: GoalCreateRequest): Promise<Goal> {
  return delay({
    id: `goal-${Date.now()}`,
    name: goal.name || "New goal",
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate,
    progressPercent: 24,
    requiredMonthlyContribution: goal.monthlyContribution ?? 6000,
    status: "attention",
    possibleImpact: "Backend projections will evaluate this goal against future scenarios.",
  });
}

export function mockReverse(_request?: ReverseRequest): Promise<ReverseResult> {
  return delay({
    targetLabel: "₹1,00,000 by March 2027",
    remainingAmount: 60000,
    requiredMonthlySaving: 10000,
    timeline: "6 monthly contributions in the sample path",
    levers: [
      { id: "expense", title: "Expense reduction", description: "A backend-provided lever for reducing discretionary outflow.", monthlyEffect: "Potential ₹3,000/month", tone: "positive" },
      { id: "income", title: "Additional income", description: "A backend-provided lever for improving goal confidence.", monthlyEffect: "Potential ₹5,000/month", tone: "positive" },
      { id: "contribution", title: "Savings contribution", description: "A steady transfer that aligns with the target timeline.", monthlyEffect: "Required ₹10,000/month", tone: "warning" },
    ],
    projection: [
      { month: "Oct", income: 55000, expenses: 25000, additionalPayment: 10000, savings: 20000, balance: 50000, cashFlowStatus: "healthy" },
      { month: "Nov", income: 55000, expenses: 25000, additionalPayment: 10000, savings: 20000, balance: 60000, cashFlowStatus: "healthy" },
      { month: "Dec", income: 55000, expenses: 31000, additionalPayment: 10000, savings: 14000, balance: 70000, cashFlowStatus: "watch" },
      { month: "Jan", income: 55000, expenses: 25000, additionalPayment: 10000, savings: 20000, balance: 80000, cashFlowStatus: "healthy" },
      { month: "Feb", income: 55000, expenses: 25000, additionalPayment: 10000, savings: 20000, balance: 90000, cashFlowStatus: "healthy" },
      { month: "Mar", income: 55000, expenses: 25000, additionalPayment: 10000, savings: 20000, balance: 100000, milestone: "Target reached", cashFlowStatus: "healthy" },
    ],
  });
}

export function mockRadar(): Promise<RadarResponse> {
  return delay({
    events: radarEvents,
    alerts: [
      { id: "rent-alert", title: "Rent before salary", description: "Rent is due before the next expected salary credit in this sample timeline.", severity: "warning" },
      { id: "subscription-alert", title: "Recurring payments clustered", description: "Subscriptions and salary fall on the same date; monitor available balance before then.", severity: "neutral" },
    ],
  });
}

export function mockExperiment(request?: ExperimentRequest): Promise<ExperimentResult> {
  return delay({
    id: "exp-phone-choice",
    scenarios: [
      {
        id: "scenario-a",
        type: "buy_now",
        title: request?.scenarios[0]?.name || "Scenario A",
        description: "Immediate purchase with a lower short-term buffer.",
        projectedBalance: 306000,
        lowestProjectedBalance: -10000,
        monthlyImpact: "One-time purchase pressure",
        goalImpact: "Potential delay for emergency fund",
        timeline: "Immediate",
        tone: "danger",
      },
      {
        id: "scenario-b",
        type: "emi",
        title: request?.scenarios[1]?.name || "Scenario B",
        description: "Installments create a steadier but recurring obligation.",
        projectedBalance: 306996,
        lowestProjectedBalance: 63333,
        monthlyImpact: "Recurring EMI pressure",
        goalImpact: "Smaller possible delay",
        timeline: "12 months",
        tone: "warning",
      },
      {
        id: "scenario-c",
        type: "save_first",
        title: request?.scenarios[2]?.name || "Scenario C",
        description: "Delayed purchase maintains near-term flexibility.",
        projectedBalance: 306000,
        lowestProjectedBalance: 70000,
        monthlyImpact: "No loan obligation",
        goalImpact: "Goal path remains closer to plan",
        timeline: "After savings buffer",
        tone: "positive",
      },
    ],
    comparison,
    differences: [
      "Buy Now creates the lowest projected balance in month one.",
      "EMI avoids the immediate dip but adds recurring payment pressure.",
      "Save First protects near-term flexibility while delaying the purchase.",
    ],
    note: "The experiment displays backend-style trade-offs without ranking a universal best option.",
  });
}
