import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackInput {
  table_id?: number;
  order_id?: string;
  overall_rating: number;
  food_quality?: number;
  service?: number;
  ambiance?: number;
  value_rating?: number;
  comment?: string;
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (feedback: FeedbackInput) => {
      const { error } = await (supabase as any).from('feedback').insert({
        table_id: feedback.table_id || null,
        order_id: feedback.order_id || null,
        overall_rating: feedback.overall_rating,
        food_quality: feedback.food_quality || null,
        service: feedback.service || null,
        ambiance: feedback.ambiance || null,
        value_rating: feedback.value_rating || null,
        comment: feedback.comment || null,
      });
      if (error) throw error;
    },
  });
}
