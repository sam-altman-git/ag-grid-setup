import React, { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import * as RadinLoadingAnimation from "@/public/lottie/radin-loader.json";
import { gridActions } from "../redux/slices/grid";
import LottiePlayer from "../components/LottiePlayer";

export default function Loader() {
  const loading = useSelector((state) => state.grid.loading);

  return (
    loading && (
      <div className="loader">
        <LottiePlayer animationData={RadinLoadingAnimation} />
      </div>
    )
  );
}

export const useLoading = () => {
  const loading = useSelector((state) => state.grid.loading);
  const dispatch = useDispatch();
  const setLoading = useCallback((value) => {
    dispatch(gridActions.setLoader(value));
  }, []);
  return { setLoading, loading };
};
