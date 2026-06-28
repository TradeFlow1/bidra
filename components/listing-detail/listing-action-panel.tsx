import type { ReactNode } from "react";

export function ListingActionPanel({
  canSplitActions,
  buyNowAction,
  offerAction,
  loginAction,
  ownerTools,
  watchlistAction,
}: {
  canSplitActions: boolean;
  buyNowAction?: ReactNode;
  offerAction?: ReactNode;
  loginAction?: ReactNode;
  ownerTools?: ReactNode;
  watchlistAction?: ReactNode;
}) {
  return (
    <>
      <div className={canSplitActions ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4"}>
        {buyNowAction}
        {offerAction}
        {loginAction}
      </div>

      {ownerTools ? (
        ownerTools
      ) : (
        <div className="mt-4 grid gap-3">
          {watchlistAction}
        </div>
      )}
    </>
  );
}