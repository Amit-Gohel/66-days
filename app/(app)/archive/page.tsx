import { getArchive } from "@/lib/queries/archive";
import { ArchiveView } from "@/components/archive/ArchiveView";

export default async function ArchivePage() {
  const data = await getArchive();
  return <ArchiveView data={data} />;
}
