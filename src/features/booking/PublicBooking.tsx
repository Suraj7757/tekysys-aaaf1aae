import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ShopReviews } from "./ShopReviews";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_mobile: "",
    customer_email: "",
    device_brand: "",
    device_model: "",
    problem_description: "",
    preferred_date: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await (supabase as any).rpc("get_shop_by_slug", {
        _slug: slug,
      });
      setShop(data);
      setLoading(false);
    })();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.user_id || isSubmitting) return;
    if (
      !form.customer_name ||
      !form.customer_mobile ||
      !form.device_brand ||
      !form.problem_description
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any).from("booking_requests").insert({
        ...form,
        user_id: shop.user_id,
        preferred_date: form.preferred_date || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Shop Not Found</h2>
            <p className="text-muted-foreground text-sm">
              This booking page doesn't exist or has been disabled.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-10 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
            <h2 className="text-2xl font-bold">Request Submitted!</h2>
            <p className="text-muted-foreground">
              {shop.shop_name} will contact you shortly on{" "}
              {form.customer_mobile}.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  customer_name: "",
                  customer_mobile: "",
                  customer_email: "",
                  device_brand: "",
                  device_model: "",
                  problem_description: "",
                  preferred_date: "",
                });
              }}
            >
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">{shop.shop_name}</h1>
          {shop.address && (
            <p className="text-sm text-muted-foreground">📍 {shop.address}</p>
          )}
          {shop.phone && (
            <p className="text-sm text-muted-foreground">📞 {shop.phone}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book a Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label>Your Name *</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  value={form.customer_mobile}
                  onChange={(e) =>
                    setForm({ ...form, customer_mobile: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) =>
                    setForm({ ...form, customer_email: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Device Brand *</Label>
                  <Input
                    value={form.device_brand}
                    onChange={(e) =>
                      setForm({ ...form, device_brand: e.target.value })
                    }
                    placeholder="Samsung"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={form.device_model}
                    onChange={(e) =>
                      setForm({ ...form, device_model: e.target.value })
                    }
                    placeholder="Galaxy A50"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <Label>Describe the problem *</Label>
                <Textarea
                  value={form.problem_description}
                  onChange={(e) =>
                    setForm({ ...form, problem_description: e.target.value })
                  }
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Preferred date (optional)</Label>
                <Input
                  type="date"
                  value={form.preferred_date}
                  onChange={(e) =>
                    setForm({ ...form, preferred_date: e.target.value })
                  }
                  min={new Date().toISOString().slice(0, 10)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <ShopReviews shopUserId={shop.user_id} />
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <LanguageSwitcher />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Powered by RepairXpert
        </p>
      </div>
    </div>
  );
}
