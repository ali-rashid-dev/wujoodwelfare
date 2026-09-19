"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Home, Loader2, Plus } from "lucide-react";
import { createDistributionCenter } from "@/app/(dashboard)/dashboard/distribution/distribution-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DistributionCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DistributionCenterModal({ isOpen, onClose }: DistributionCenterModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("Lahore");
  const [address, setAddress] = useState("");
  const [inChargeName, setInChargeName] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !address) {
      toast.error("Please fill in center name, city, and address");
      return;
    }

    setLoading(true);
    try {
      const res = await createDistributionCenter({
        name,
        city,
        address,
        inChargeName: inChargeName || undefined,
        phone: phone || undefined,
        isActive,
      });

      if (res.success) {
        toast.success(`Distribution center "${name}" created!`);
        onClose();
        setName("");
        setAddress("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create center");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Home className="h-5 w-5" />
            <span>Distribution Warehouse Setup</span>
          </div>
          <DialogTitle className="text-xl font-bold">Add Distribution Center</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Register field warehouses, distribution centers, or emergency dispatch hubs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Center Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lahore Central Relief Center"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City *</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore / Karachi"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Contact Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 xxxxxxx"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Location Address *</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building #, Street, Area, City"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">In-Charge Officer Name</Label>
            <Input
              value={inChargeName}
              onChange={(e) => setInChargeName(e.target.value)}
              placeholder="e.g. Manager Tariq Mahmood"
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
            <div>
              <span className="text-xs font-semibold text-foreground">Center Active Status</span>
              <p className="text-[11px] text-muted-foreground">Active for package dispatch</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Center
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
