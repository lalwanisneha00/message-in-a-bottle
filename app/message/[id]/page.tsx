import { supabase } from "../../../lib/supabase";

import AnimatedBeach from "../../components/AnimatedBeach";
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

  return (
    <AnimatedBeach>

      <ReceiverExperience
        message={
          data?.message ??
          "Message not found"
        }
      />

    </AnimatedBeach>
  );
}