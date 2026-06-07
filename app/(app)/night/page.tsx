import { getNightData } from "@/lib/queries/night";
import { NightSessionFlow } from "@/components/night/NightSessionFlow";

export default async function NightPage() {
  const data = await getNightData();
  return <NightSessionFlow data={data} />;
}
