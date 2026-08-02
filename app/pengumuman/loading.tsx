import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton withFilters={false} variant="stack" count={5} />;
}
