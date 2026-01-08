import Lottie from "react-lottie";
import React, { useMemo } from "react";

const LottiePlayer = ({ animationData }) => {
  const defaultOptions = useMemo(() => {
    return {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
  }, [animationData]);

  return <Lottie options={defaultOptions} height={400} width={400} />;
};

export default React.memo(LottiePlayer);
