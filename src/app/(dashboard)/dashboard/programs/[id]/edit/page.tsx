import React from "react";
import { notFound } from "next/navigation";
import { getProgramById } from "../../program-actions";
import { ProgramForm } from "@/components/programs/ProgramForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProgramPage({ params }: PageProps) {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    notFound();
  }

  return <ProgramForm initialData={program} isEditing />;
}
