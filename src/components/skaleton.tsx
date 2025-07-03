import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const Skaleton = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={twMerge("bg-zinc-900/10 animate-pulse", className)}
      {...props}
    />
  );
};

export default Skaleton;
