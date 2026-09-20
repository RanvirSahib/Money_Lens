import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserId,
  fetchProfile,
  updateProfile,
  fetchEMIs,
  createEMI,
  updateEMI,
  deleteEMI,
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  fetchSpendingInsights,
  fetchGoals,
  createGoal,
  deleteGoal,
  simulatePurchase,
  simulateEMI,
  simulateSavings,
  compareExperiments,
  fetchRadar,
  fetchDiscrepancies,
  sendChatMessage,
  confirmChatAction,
  uploadBankStatement,
  fetchStatementTransactions,
  UserFinancialProfile,
  UserEMI,
  EMICreatePayload,
  UserSubscription,
  SubscriptionCreatePayload,
  UserInvestment,
  InvestmentCreatePayload,
  fetchInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from "@/lib/api-client";

export function useProfile(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useInvestments(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["investments", userId],
    queryFn: () => fetchInvestments(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateInvestment(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvestmentCreatePayload) => createInvestment(payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateInvestment(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invId, payload }: { invId: string; payload: Partial<InvestmentCreatePayload> }) =>
      updateInvestment(invId, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteInvestment(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invId: string) => deleteInvestment(invId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSubscriptions(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: () => fetchSubscriptions(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSubscription(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionCreatePayload) => createSubscription(payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateSubscription(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, payload }: { subId: string; payload: Partial<SubscriptionCreatePayload> }) =>
      updateSubscription(subId, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteSubscription(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subId: string) => deleteSubscription(subId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useEMIs(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["emis", userId],
    queryFn: () => fetchEMIs(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEMI(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EMICreatePayload) => createEMI(payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emis", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateEMI(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emiId, payload }: { emiId: string; payload: Partial<EMICreatePayload> }) =>
      updateEMI(emiId, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emis", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteEMI(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emiId: string) => deleteEMI(emiId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emis", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRadar(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["radar", userId],
    queryFn: () => fetchRadar(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDiscrepancies(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["discrepancies", userId],
    queryFn: () => fetchDiscrepancies(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<UserFinancialProfile>) => updateProfile(updates, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data);
      queryClient.invalidateQueries({ queryKey: ["spending", userId] });
      queryClient.invalidateQueries({ queryKey: ["statement_transactions", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["radar", userId] });
    },
  });
}

export function useSpending(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["spending", userId],
    queryFn: () => fetchSpendingInsights(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStatementTransactions(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["statement_transactions", userId],
    queryFn: () => fetchStatementTransactions(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadStatement(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, saveRaw }: { file: File; saveRaw: boolean }) =>
      uploadBankStatement(file, saveRaw, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["spending", userId] });
      queryClient.invalidateQueries({ queryKey: ["statement_transactions", userId] });
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGoals(userId: string = getCurrentUserId()) {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGoal(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: any) => createGoal(goal, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteGoal(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChatbot(userId: string = getCurrentUserId()) {
  const queryClient = useQueryClient();

  const invalidateFinancialState = (updatedProfile?: any) => {
    if (updatedProfile) {
      queryClient.setQueryData(["profile", userId], updatedProfile);
    }
    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    queryClient.invalidateQueries({ queryKey: ["radar", userId] });
    queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["spending", userId] });
    queryClient.invalidateQueries({ queryKey: ["statement_transactions", userId] });
    queryClient.invalidateQueries({ queryKey: ["emis", userId] });
    queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    queryClient.invalidateQueries({ queryKey: ["investments", userId] });
    queryClient.invalidateQueries({ queryKey: ["discrepancies", userId] });
  };

  const sendMessage = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      sendChatMessage(message, sessionId, userId),
    onSuccess: (res) => {
      if (res?.action_payload?.confirmed || res?.relevant_metrics?.confirmed) {
        invalidateFinancialState(res?.relevant_metrics?.updated_entity || res?.updated_entity);
      }
    },
  });

  const confirmAction = useMutation({
    mutationFn: ({
      actionType,
      data,
    }: {
      actionType: "UPDATE_PROFILE" | "CREATE_GOAL" | "CREATE_EMI" | "CREATE_SUBSCRIPTION" | "CREATE_INVESTMENT";
      data: any;
    }) => confirmChatAction(actionType, data, userId),
    onSuccess: (res, variables) => {
      if (variables.actionType === "UPDATE_PROFILE" && res?.updated_entity) {
        queryClient.setQueryData(["profile", userId], res.updated_entity);
      }
      invalidateFinancialState(res?.updated_entity);
    },
  });

  return { sendMessage, confirmAction };
}
