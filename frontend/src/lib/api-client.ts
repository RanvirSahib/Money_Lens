/**
 * Centralized Typed API Client for Money Lens.
 * Connects the Lovable frontend directly to the existing Money Lens FastAPI backend (http://localhost:8000).
 */

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = isBrowser
  ? (import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8000/api/v1' : '/api/v1'))
  : 'http://localhost:8000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export function getCurrentUser(): MonexaUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('monexa_user') || localStorage.getItem('moneylens_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string {
  const user = getCurrentUser();
  if (user?.id) return user.id;
  if (user?.email) return `usr_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return 'usr_demo_01';
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    const currentUserId = getCurrentUserId();
    localStorage.removeItem('monexa_token');
    localStorage.removeItem('monexa_user');
    localStorage.removeItem('moneylens_token');
    localStorage.removeItem('moneylens_user');
    localStorage.removeItem('monexa_chat_messages');
    localStorage.removeItem('monexa_chat_session_id');
    localStorage.removeItem(`monexa_chat_messages_${currentUserId}`);
    localStorage.removeItem(`monexa_chat_session_id_${currentUserId}`);
    sessionStorage.clear();
    window.dispatchEvent(new Event('monexa_auth_change'));
  } catch (e) {
    console.warn("Error during logout cleanup:", e);
  }
}

// ----------------------------------------------------------------------
// 1. Profile & Account Types and APIs
// ----------------------------------------------------------------------
export interface UserFinancialProfile {
  id?: string;
  user_id?: string;
  name: string;
  monthly_income: number;
  essential_expenses: number;
  discretionary_expenses: number;
  current_savings: number;
  monthly_investments: number;
  active_emis: number;
  active_loans: number;
  other_recurring_expenses: number;
  total_monthly_expenses: number;
  monthly_surplus: number;
  savings_rate_pct: number;
  dti_ratio_pct: number;
  emergency_fund_runway_months: number;
  health_score: number;
}

export async function fetchProfile(userId: string = getCurrentUserId()): Promise<UserFinancialProfile> {
  try {
    return await apiFetch<UserFinancialProfile>(`/profile?user_id=${encodeURIComponent(userId)}`);
  } catch (err) {
    const currUser = getCurrentUser();
    console.warn("Using baseline profile for user:", err);
    return {
      name: currUser?.name || "User",
      monthly_income: 0,
      essential_expenses: 0,
      discretionary_expenses: 0,
      current_savings: 0,
      monthly_investments: 0,
      active_emis: 0,
      active_loans: 0,
      other_recurring_expenses: 0,
      total_monthly_expenses: 0,
      monthly_surplus: 0,
      savings_rate_pct: 0,
      dti_ratio_pct: 0,
      emergency_fund_runway_months: 0,
      health_score: 50,
    };
  }
}

export async function updateProfile(updates: Partial<UserFinancialProfile>, userId: string = getCurrentUserId()): Promise<UserFinancialProfile> {
  return apiFetch<UserFinancialProfile>(`/profile?user_id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function submitFeedback(payload: {
  name?: string;
  email?: string;
  category: string;
  rating?: number;
  message: string;
}): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>('/profile/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface UserEMI {
  id: string;
  user_id: string;
  name: string;
  category: string;
  principal_amount: number;
  interest_rate_pct: number;
  tenure_months: number;
  remaining_months: number;
  monthly_emi: number;
  total_interest_payable: number;
  start_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EMICreatePayload {
  name: string;
  category?: string;
  principal_amount: number;
  interest_rate_pct: number;
  tenure_months: number;
  remaining_months?: number;
  monthly_emi?: number;
  start_date?: string;
}

export async function fetchEMIs(userId: string = getCurrentUserId()): Promise<UserEMI[]> {
  try {
    return await apiFetch<UserEMI[]>(`/profile/emis?user_id=${encodeURIComponent(userId)}`);
  } catch (err) {
    console.warn("Error fetching EMIs:", err);
    return [];
  }
}

export async function createEMI(payload: EMICreatePayload, userId: string = getCurrentUserId()): Promise<UserEMI> {
  return apiFetch<UserEMI>(`/profile/emis?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEMI(emiId: string, payload: Partial<EMICreatePayload>, userId: string = getCurrentUserId()): Promise<UserEMI> {
  return apiFetch<UserEMI>(`/profile/emis/${encodeURIComponent(emiId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteEMI(emiId: string, userId: string = getCurrentUserId()): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>(`/profile/emis/${encodeURIComponent(emiId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export interface UserSubscription {
  id: string;
  user_id: string;
  name: string;
  category: string;
  billing_frequency: 'monthly' | 'yearly' | 'quarterly' | string;
  amount: number;
  monthly_equivalent: number;
  annual_cost: number;
  renewal_date?: string | null;
  status: string;
  auto_renew: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SubscriptionCreatePayload {
  name: string;
  category?: string;
  billing_frequency: 'monthly' | 'yearly' | 'quarterly' | string;
  amount: number;
  renewal_date?: string;
  status?: string;
  auto_renew?: boolean;
}

export async function fetchSubscriptions(userId: string = getCurrentUserId()): Promise<UserSubscription[]> {
  try {
    return await apiFetch<UserSubscription[]>(`/profile/subscriptions?user_id=${encodeURIComponent(userId)}`);
  } catch (err) {
    console.warn("Error fetching subscriptions:", err);
    return [];
  }
}

export async function createSubscription(payload: SubscriptionCreatePayload, userId: string = getCurrentUserId()): Promise<UserSubscription> {
  return apiFetch<UserSubscription>(`/profile/subscriptions?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSubscription(subId: string, payload: Partial<SubscriptionCreatePayload>, userId: string = getCurrentUserId()): Promise<UserSubscription> {
  return apiFetch<UserSubscription>(`/profile/subscriptions/${encodeURIComponent(subId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteSubscription(subId: string, userId: string = getCurrentUserId()): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>(`/profile/subscriptions/${encodeURIComponent(subId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export interface UserInvestment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  asset_class: string;
  monthly_amount: number;
  expected_return_pct: number;
  annual_contribution: number;
  sip_date?: number | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InvestmentCreatePayload {
  name: string;
  category?: string;
  asset_class?: string;
  monthly_amount: number;
  expected_return_pct?: number;
  sip_date?: number | null;
  status?: string;
}

export async function fetchInvestments(userId: string = getCurrentUserId()): Promise<UserInvestment[]> {
  try {
    return await apiFetch<UserInvestment[]>(`/profile/investments?user_id=${encodeURIComponent(userId)}`);
  } catch (err) {
    console.warn("Error fetching investments:", err);
    return [];
  }
}

export async function createInvestment(payload: InvestmentCreatePayload, userId: string = getCurrentUserId()): Promise<UserInvestment> {
  return apiFetch<UserInvestment>(`/profile/investments?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInvestment(invId: string, payload: Partial<InvestmentCreatePayload>, userId: string = getCurrentUserId()): Promise<UserInvestment> {
  return apiFetch<UserInvestment>(`/profile/investments/${encodeURIComponent(invId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteInvestment(invId: string, userId: string = getCurrentUserId()): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>(`/profile/investments/${encodeURIComponent(invId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}


// ----------------------------------------------------------------------
// 2. Spending Insights Types and APIs
// ----------------------------------------------------------------------
export interface CategorySpending {
  category: string;
  total_amount: number;
  percentage_of_total: number;
  transaction_count: number;
  is_essential: boolean;
  is_recurring: boolean;
}

export interface SpendingInsightsResponse {
  total_spending: number;
  essential_total: number;
  discretionary_total: number;
  essential_pct: number;
  discretionary_pct: number;
  recurring_total: number;
  weekend_spending: number;
  weekday_spending: number;
  weekend_pct: number;
  categories: CategorySpending[];
  observations: {
    type: string;
    title: string;
    summary: string;
    evidence: string;
    implication: string;
    possible_action: string;
  }[];
}

export async function fetchSpendingInsights(userId: string = getCurrentUserId()): Promise<SpendingInsightsResponse> {
  return apiFetch<SpendingInsightsResponse>(`/spending/insights?user_id=${encodeURIComponent(userId)}`);
}

// ----------------------------------------------------------------------
// 3. Bank Statement Intelligence
// ----------------------------------------------------------------------
export interface StatementTransactionItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  is_recurring: boolean;
  is_essential: boolean;
}

export async function uploadBankStatement(file: File, saveRaw: boolean, userId: string = getCurrentUserId()) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('save_raw', String(saveRaw));
  formData.append('user_id', userId);

  const res = await fetch(`${API_BASE_URL}/statements/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload statement');
  }

  return res.json();
}

export async function fetchStatementTransactions(userId: string = getCurrentUserId()): Promise<StatementTransactionItem[]> {
  try {
    return await apiFetch<StatementTransactionItem[]>(`/statements/transactions?user_id=${encodeURIComponent(userId)}`);
  } catch {
    return [];
  }
}


// ----------------------------------------------------------------------
// 4. Goals APIs
// ----------------------------------------------------------------------
export interface GoalItem {
  id: string;
  title: string;
  target_amount: number;
  current_savings_allocated: number;
  target_months?: number;
  target_date?: string;
  category?: string;
  priority?: string;
}

export async function fetchGoals(userId: string = getCurrentUserId()): Promise<GoalItem[]> {
  try {
    return await apiFetch<GoalItem[]>(`/goals/saved?user_id=${encodeURIComponent(userId)}`);
  } catch {
    return [];
  }
}

export async function createGoal(goal: {
  title: string;
  target_amount: number;
  target_months?: number;
  current_savings_allocated?: number;
  category?: string;
  priority?: string;
  user_id?: string;
}, userId: string = getCurrentUserId()): Promise<GoalItem> {
  return apiFetch<GoalItem>(`/goals/save?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ ...goal, user_id: goal.user_id || userId }),
  });
}

export async function deleteGoal(goalId: string, userId: string = getCurrentUserId()): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/goals/saved/${goalId}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}


export async function calculateGoal(payload: {
  target_amount: number;
  current_savings_allocated?: number;
  monthly_surplus: number;
  target_months?: number;
  title?: string;
}) {
  return apiFetch<any>('/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reverseGoal(payload: {
  target_amount: number;
  current_savings_allocated?: number;
  current_monthly_surplus: number;
  target_months?: number;
  title?: string;
}) {
  return apiFetch<any>('/goals/reverse', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function analyzeReverseGoal(payload: {
  target_amount: number;
  current_savings_allocated?: number;
  current_monthly_surplus: number;
  target_months?: number;
  title?: string;
  context_note?: string;
}) {
  return apiFetch<any>('/goals/reverse/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------
// 5. Simulations & Experiments
// ----------------------------------------------------------------------
export async function simulatePurchase(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  purchase_amount: number;
}) {
  return apiFetch<any>('/simulate/purchase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function analyzePurchase(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  purchase_amount: number;
  context_note?: string;
}) {
  return apiFetch<any>('/simulate/purchase/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulateEMI(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  purchase_amount?: number;
  loan_amount?: number;
  annual_interest_rate?: number;
  annual_interest_rate_pct?: number;
  tenure_months: number;
  down_payment?: number;
}) {
  const req = {
    purchase_amount: payload.purchase_amount ?? payload.loan_amount ?? 100000,
    down_payment: payload.down_payment ?? 0,
    annual_interest_rate_pct: payload.annual_interest_rate_pct ?? payload.annual_interest_rate ?? 10.5,
    tenure_months: payload.tenure_months,
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    current_savings: payload.current_savings,
    existing_emi: payload.existing_emi ?? 0,
  };
  return apiFetch<any>('/simulate/emi', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function analyzeEMI(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  purchase_amount?: number;
  loan_amount?: number;
  annual_interest_rate?: number;
  annual_interest_rate_pct?: number;
  tenure_months: number;
  down_payment?: number;
  context_note?: string;
}) {
  const req = {
    purchase_amount: payload.purchase_amount ?? payload.loan_amount ?? 100000,
    down_payment: payload.down_payment ?? 0,
    annual_interest_rate_pct: payload.annual_interest_rate_pct ?? payload.annual_interest_rate ?? 10.5,
    tenure_months: payload.tenure_months,
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    current_savings: payload.current_savings,
    existing_emi: payload.existing_emi ?? 0,
    context_note: payload.context_note,
  };
  return apiFetch<any>('/simulate/emi/analyze', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function simulateSavings(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  annual_return_pct?: number;
  annual_return_rate?: number;
  duration_months?: number;
  projection_months?: number;
}) {
  const req = {
    current_savings: payload.current_savings,
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    existing_emi: payload.existing_emi ?? 0,
    annual_return_pct: payload.annual_return_pct ?? payload.annual_return_rate ?? 7.0,
    duration_months: payload.duration_months ?? payload.projection_months ?? 36,
  };
  return apiFetch<any>('/simulate/savings', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function analyzeSavings(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  annual_return_pct?: number;
  annual_return_rate?: number;
  duration_months?: number;
  projection_months?: number;
  context_note?: string;
}) {
  const req = {
    current_savings: payload.current_savings,
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    existing_emi: payload.existing_emi ?? 0,
    annual_return_pct: payload.annual_return_pct ?? payload.annual_return_rate ?? 7.0,
    duration_months: payload.duration_months ?? payload.projection_months ?? 36,
    context_note: payload.context_note,
  };
  return apiFetch<any>('/simulate/savings/analyze', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function compareExperiments(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  scenarios: Array<{
    scenario_id?: string;
    scenario_name?: string;
    name?: string;
    scenario_type: 'no_purchase' | 'cash_purchase' | 'emi_purchase' | 'custom';
    purchase_amount?: number;
    down_payment?: number;
    annual_interest_rate_pct?: number;
    annual_interest_rate?: number;
    tenure_months?: number;
    expense_adjustment?: number;
    monthly_saving_boost?: number;
  }>;
}) {
  const req = {
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    current_savings: payload.current_savings,
    existing_emi: payload.existing_emi ?? 0,
    scenarios: payload.scenarios.map((sc, i) => ({
      scenario_id: sc.scenario_id || `sc_${i + 1}`,
      scenario_name: sc.scenario_name || sc.name || `Scenario ${i + 1}`,
      scenario_type: sc.scenario_type,
      purchase_amount: sc.purchase_amount ?? 0,
      down_payment: sc.down_payment ?? 0,
      annual_interest_rate_pct: sc.annual_interest_rate_pct ?? sc.annual_interest_rate ?? 12.0,
      tenure_months: sc.tenure_months ?? 12,
      expense_adjustment: sc.expense_adjustment ?? (sc.monthly_saving_boost ? -sc.monthly_saving_boost : 0),
    })),
  };
  return apiFetch<any>('/experiments/compare', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function analyzeExperiments(payload: {
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  existing_emi?: number;
  scenarios: Array<{
    scenario_id?: string;
    scenario_name?: string;
    name?: string;
    scenario_type: 'no_purchase' | 'cash_purchase' | 'emi_purchase' | 'custom';
    purchase_amount?: number;
    down_payment?: number;
    annual_interest_rate_pct?: number;
    annual_interest_rate?: number;
    tenure_months?: number;
    expense_adjustment?: number;
    monthly_saving_boost?: number;
  }>;
  context_note?: string;
}) {
  const req = {
    monthly_income: payload.monthly_income,
    monthly_expenses: payload.monthly_expenses,
    current_savings: payload.current_savings,
    existing_emi: payload.existing_emi ?? 0,
    scenarios: payload.scenarios.map((sc, i) => ({
      scenario_id: sc.scenario_id || `sc_${i + 1}`,
      scenario_name: sc.scenario_name || sc.name || `Scenario ${i + 1}`,
      scenario_type: sc.scenario_type,
      purchase_amount: sc.purchase_amount ?? 0,
      down_payment: sc.down_payment ?? 0,
      annual_interest_rate_pct: sc.annual_interest_rate_pct ?? sc.annual_interest_rate ?? 12.0,
      tenure_months: sc.tenure_months ?? 12,
      expense_adjustment: sc.expense_adjustment ?? (sc.monthly_saving_boost ? -sc.monthly_saving_boost : 0),
    })),
    context_note: payload.context_note,
  };
  return apiFetch<any>('/experiments/compare/analyze', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ----------------------------------------------------------------------
// 6. Financial Radar & Discrepancies
// ----------------------------------------------------------------------
export interface RadarAlertItem {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning';
  title: string;
  message: string;
  metric_value: number;
  threshold_value: number;
  trigger_rule: string;
  impact: string;
  implication?: string | null;
  possible_action?: string | null;
  action_type?: string | null;
  action_link?: string | null;
  evidence?: string | null;
}

export interface FinancialRadarData {
  overall_health: 'healthy' | 'excellent' | 'vulnerable' | 'at_risk' | string;
  health_score: number;
  total_alerts: number;
  alerts: RadarAlertItem[];
  metrics_summary: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_surplus: number;
    savings_rate_pct: number;
    current_savings: number;
    emergency_fund_months: number;
    debt_to_income_pct: number;
    recurring_expense_ratio_pct: number;
    monthly_investments?: number;
    active_loans?: number;
  };
  radar_rules_evaluated: number;
  assumptions: string[];
}

export async function fetchRadar(userId: string = getCurrentUserId()): Promise<FinancialRadarData> {
  return apiFetch<FinancialRadarData>(`/radar?user_id=${encodeURIComponent(userId)}`);
}

export async function fetchDiscrepancies(userId: string = getCurrentUserId()) {
  return apiFetch<any[]>(`/profile/discrepancies?user_id=${encodeURIComponent(userId)}`);
}

// ----------------------------------------------------------------------
// 7. Conversational Chatbot
// ----------------------------------------------------------------------
export async function sendChatMessage(message: string, sessionId?: string, userId: string = getCurrentUserId()) {
  return apiFetch<any>('/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
      include_statement_insights: true,
    }),
  });
}

export async function confirmChatAction(
  actionType: 'UPDATE_PROFILE' | 'CREATE_GOAL' | 'CREATE_EMI' | 'CREATE_SUBSCRIPTION' | 'CREATE_INVESTMENT',
  data: any,
  userId: string = getCurrentUserId()
) {
  return apiFetch<any>('/chat/confirm-action', {
    method: 'POST',
    body: JSON.stringify({
      action_type: actionType,
      data,
      user_id: userId,
    }),
  });
}

// ----------------------------------------------------------------------
// 8. User Authentication & OTP APIs
// ----------------------------------------------------------------------
export interface MonexaUser {
  id: string;
  email: string;
  username?: string | null;
  name: string;
  mobile?: string | null;
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  health_score: number;
  created_at?: string | null;
}

export interface AuthResponseData {
  user: MonexaUser;
  token: string;
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  mobile?: string;
  username: string;
  password: string;
  otp_code?: string;
  monthly_income?: number;
  essential_expenses?: number;
  discretionary_expenses?: number;
  monthly_expenses?: number;
  current_savings?: number;
}

export interface ResetPasswordPayload {
  email: string;
  otp_code: string;
  new_password: string;
}

export async function loginUser(identifier: string, password: string): Promise<AuthResponseData> {
  return apiFetch<AuthResponseData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponseData> {
  return apiFetch<AuthResponseData>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendOtp(email: string, purpose: string = 'signup'): Promise<{ success: boolean; email: string; message: string }> {
  return apiFetch<{ success: boolean; email: string; message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  });
}

export async function verifyOtp(email: string, otp_code: string): Promise<{ success: boolean; email: string; message: string }> {
  return apiFetch<{ success: boolean; email: string; message: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code }),
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<AuthResponseData> {
  return apiFetch<AuthResponseData>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchUserProfile(userId: string): Promise<MonexaUser> {
  return apiFetch<MonexaUser>(`/auth/users/${encodeURIComponent(userId)}`);
}

export interface UpdateUserProfilePayload {
  name?: string;
  username?: string;
  mobile?: string;
  monthly_income?: number;
  essential_expenses?: number;
  discretionary_expenses?: number;
  monthly_expenses?: number;
  current_savings?: number;
  current_password?: string;
  new_password?: string;
}

export async function updateUserProfile(userId: string, payload: UpdateUserProfilePayload): Promise<MonexaUser> {
  const res = await apiFetch<MonexaUser>(`/auth/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const curr = getCurrentUser();
  if (curr && (curr.id === userId || curr.email === res.email)) {
    const merged = { ...curr, ...res };
    localStorage.setItem('monexa_user', JSON.stringify(merged));
    localStorage.setItem('moneylens_user', JSON.stringify(merged));
  }
  return res;
}

