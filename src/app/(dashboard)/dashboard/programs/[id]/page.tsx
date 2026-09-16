import React from "react";
import { notFound } from "next/navigation";
import { getProgramById } from "../program-actions";
import { ProgramProfile } from "@/components/programs/ProgramProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    notFound();
  }

  return <ProgramProfile program={program} />;
}
