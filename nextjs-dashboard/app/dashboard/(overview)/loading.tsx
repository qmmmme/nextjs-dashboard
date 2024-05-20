//first way to implement a streaming whole page built on top of the Suspense component
// /dashboard/(overview)/page.tsx becomes /dashboard.


import DashboardSkeleton from "../../ui/skeletons";
export default function Loading() {
    return <DashboardSkeleton/>;
  }