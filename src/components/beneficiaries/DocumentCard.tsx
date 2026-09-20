"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, ExternalLink, Trash2, Shield, Stethoscope, Award, FileCheck } from "lucide-react";
import { deleteBeneficiaryDocument } from "@/app/(dashboard)/dashboard/beneficiaries/beneficiaries";
import { DocumentType } from "@prisma/client";

interface DocumentCardProps {
  id: string;
  beneficiaryId: string;
  label?: string | null;
  type: DocumentType | string;
  fileUrl: string;
  uploadedAt: string | Date;
  onDelete?: () => void;
}

export function DocumentCard({
  id,
  beneficiaryId,
  label,
  type,
  fileUrl,
  uploadedAt,
  onDelete,
}: DocumentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getDocIcon = () => {
    switch (type) {
      case "CNIC":
      case "B_FORM":
        return Shield;
      case "PROOF_OF_INCOME":
        return Award;
      case "MEDICAL_REPORT":
        return Stethoscope;
      case "PROOF_OF_RESIDENCE":
        return FileCheck;
      default:
        return FileText;
    }
  };

  const icon = getDocIcon();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteBeneficiaryDocument(id, beneficiaryId);
      if (res.success) {
        toast.success("Document removed successfully");
        onDelete?.();
      } else {
        toast.error(res.error || "Failed to delete document");
      }
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const dateStr = new Date(uploadedAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <Card className="group hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {React.createElement(icon, { className: "w-5 h-5" })}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm truncate text-foreground">{label || type.replace(/_/g, " ")}</h4>
                <Badge variant="secondary" className="text-[10px] px-2 py-0 uppercase font-normal">
                  {type.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Uploaded {dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1.5 text-xs" })}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View
            </a>

            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setShowConfirm(true)}
              aria-label="Delete document"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Document Reference?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{label || type}</strong> from this beneficiary profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Remove Document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
