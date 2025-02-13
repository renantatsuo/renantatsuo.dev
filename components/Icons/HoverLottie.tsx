import dynamic from 'next/dynamic';
import { useState } from "react";
import FlatColorLottie from "./FlatColorLottie";
import LottieFactory from "./LottieFactory";
import LottieType from "./LottieType";
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
type HoverLottieProps = {
  icon: LottieType;
  title?: string;
  color?: string;
};

export default function HoverLottie({ icon, title, color }: HoverLottieProps) {
  const animation = LottieFactory.create(icon);
  const animationData = color
    ? FlatColorLottie(animation, color).data
    : animation.data;
  const [isHover, setIsHover] = useState(false);

  return (
    <Lottie
      animationData={animationData}
      title={title}
      autoplay={isHover}
      onPointerOver={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
    />
  );
}
