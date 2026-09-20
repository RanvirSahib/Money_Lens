import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  updateProfile,
  fetchSpendingInsights,
  fetchGoals,
  createGoal,
  deleteGoal,
  simulatePurchase,
  simulateEMI,
  sendChatMessage,
  confirmChatAction,
  uploadBankStatement,
  fetchStatementTransactions,
  UserFinancialProfile,
} from "@/lib/api-client";

export function useProfile(userId: string = "usr_demo_01") {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useUpdateProfile(userId: string = "usr_demo_01") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<UserFinancialProfile>) => updateProfile(updates, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data);
      queryClient.invalidateQueries({ queryKey: ["spending"] });
      queryClient.invalidateQueries({ queryKey: ["statement_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSpending(userId: string = "usr_demo_01") {
  return useQuery({
    queryKey: ["spending", userId],
    queryFn: () => fetchSpendingInsights(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStatementTransactions(userId: string = "usr_demo_01") {
  return useQuery({
    queryKey: ["statement_transactions", userId],
    queryFn: () => fetchStatementTransactions(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadStatement(userId: string = "usr_demo_01") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, saveRaw }: { file: File; saveRaw: boolean }) =>
      uploadBankStatement(file, saveRaw, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["spending"] });
      queryClient.invalidateQueries({ queryKey: ["statement_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChatbot(userId: string = "usr_demo_01") {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      sendChatMessage(message, sessionId, userId),
  });

  const confirmAction = useMutation({
    mutationFn: ({ actionType, data }: { actionType: "UPDATE_PROFILE" | "CREATE_GOAL"; data: any }) =>
      confirmChatAction(actionType, data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["spending"] });
      queryClient.invalidateQueries({ queryKey: ["statement_transactions"] });
    },
  });

  return { sendMessage, confirmAction };
}
