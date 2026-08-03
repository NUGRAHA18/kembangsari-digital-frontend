import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton variant="stack" count={6} />;
}
