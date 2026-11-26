import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCustomer } from "@/contexts/CustomerContext";
import { sampleJourneys, type Journey } from "@/lib/userJourneys";
import { editJourneyTags, type JourneyTagEdits, type TransportMode } from "@/lib/journeyTransport";

export function useExampleJourneyTags(userId: string | undefined) {
  const { selectedCustomerId } = useCustomer();
  const client = useQueryClient();
  const key = ["example-journey-tags", selectedCustomerId, userId];
  const { data: edits = {} } = useQuery<JourneyTagEdits>({ queryKey: key, queryFn: () => ({}), initialData: {}, staleTime: Infinity, gcTime: Infinity });
  const journeys: Journey[] = sampleJourneys.map((journey) => ({ ...journey, ...edits[journey.id] }));
  const updateTags = (ids: string[], mode: TransportMode) => {
    if (!selectedCustomerId || !userId) return;
    client.setQueryData<JourneyTagEdits>(key, (current = {}) => editJourneyTags(current, ids, mode));
  };
  return { journeys, updateTags, scope: `${selectedCustomerId}:${userId}` };
}