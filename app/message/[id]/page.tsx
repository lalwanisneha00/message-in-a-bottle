import { supabase } from "../../../lib/supabase";

import ReceiverExperience from "../../components/ReceiverExperience";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .single();

  return <ReceiverExperience message={data?.message ?? null} />;
}
