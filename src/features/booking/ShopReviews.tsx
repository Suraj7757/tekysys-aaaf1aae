import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Props {
  shopUserId: string;
  jobId?: string;
}

export function ShopReviews({ shopUserId, jobId }: Props) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ count: number; average: number }>({
    count: 0,
    average: 0,
  });
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [{ data: list }, { data: sum }] = await Promise.all([
      (supabase as any)
        .from("shop_reviews")
        .select("*")
        .eq("user_id", shopUserId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20),
      (supabase as any).rpc("get_shop_rating_summary", {
        _user_id: shopUserId,
      }),
    ]);
    setReviews(list || []);
    if (sum)
      setSummary({ count: sum.count || 0, average: Number(sum.average) || 0 });
  };

  useEffect(() => {
    if (shopUserId) load();
  }, [shopUserId]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Pick a rating");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("shop_reviews").insert({
      user_id: shopUserId,
      job_id: jobId || null,
      customer_name: name.trim(),
      customer_mobile: mobile.trim() || null,
      rating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("booking.reviewThanks"));
    setName("");
    setMobile("");
    setComment("");
    setRating(5);
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("booking.reviewsTitle")}
            {summary.count > 0 && (
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {summary.average} ({summary.count})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("booking.noReviews")}
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="border-b pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.customer_name}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground mt-1">
                  {r.comment}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("booking.leaveReview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={t("common.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder={t("common.mobile")}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm mb-1">{t("booking.rating")}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star
                    className={`h-7 w-7 transition ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-amber-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder={t("booking.writeComment")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <Button onClick={submit} disabled={submitting} className="w-full">
            {t("booking.submitReview")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
