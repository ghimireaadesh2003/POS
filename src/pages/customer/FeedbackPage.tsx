import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSearchParams } from 'react-router-dom';
import { useSubmitFeedback } from '@/hooks/useFeedback';
import { toast } from 'sonner';

const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const aspects = [
    { label: 'Food Quality', emoji: '🍽️', key: 'food_quality' },
    { label: 'Service', emoji: '🤵', key: 'service' },
    { label: 'Ambiance', emoji: '✨', key: 'ambiance' },
    { label: 'Value', emoji: '💰', key: 'value_rating' },
  ];
  const [aspectRatings, setAspectRatings] = useState<Record<string, number>>({});

  const handleSubmit = async () => {
    try {
      await submitFeedback.mutateAsync({
        table_id: table ? parseInt(table) : undefined,
        overall_rating: rating,
        food_quality: aspectRatings['Food Quality'] || undefined,
        service: aspectRatings['Service'] || undefined,
        ambiance: aspectRatings['Ambiance'] || undefined,
        value_rating: aspectRatings['Value'] || undefined,
        comment: comment || undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Thank You!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">Your feedback helps us create a better dining experience. We appreciate you taking the time.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold text-foreground text-center">How was your experience?</h1>
        <p className="text-muted-foreground text-sm text-center mt-1">
          {table ? `Table ${table}` : ''} · We'd love your feedback
        </p>
      </motion.div>

      {/* Overall Rating */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-card text-center space-y-3">
        <p className="text-sm font-medium text-foreground">Overall Rating</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating) ? 'fill-accent text-accent' : 'text-border'}`} />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
        </p>
      </motion.div>

      {/* Aspect Ratings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-3">
        {aspects.map(aspect => (
          <div key={aspect.label} className="bg-card rounded-xl border border-border p-4 shadow-card text-center space-y-2">
            <span className="text-2xl">{aspect.emoji}</span>
            <p className="text-xs font-medium text-foreground">{aspect.label}</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setAspectRatings(prev => ({ ...prev, [aspect.label]: star }))}>
                  <Star className={`w-4 h-4 transition-colors ${star <= (aspectRatings[aspect.label] || 0) ? 'fill-accent text-accent' : 'text-border'}`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Comment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
        <p className="text-sm font-medium text-foreground">Any comments? (optional)</p>
        <Textarea placeholder="Tell us what you loved or how we can improve..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="resize-none" />
      </motion.div>

      {/* Submit */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Button className="w-full h-12 text-base" disabled={rating === 0 || submitFeedback.isPending} onClick={handleSubmit}>
          <Send className="w-4 h-4 mr-2" />{submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </motion.div>
    </div>
  );
};

export default FeedbackPage;
