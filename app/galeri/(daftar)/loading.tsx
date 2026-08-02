import { ListPageSkeleton } from "@/components/ui/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton withFilters={false} count={6} />;
}
