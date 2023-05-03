import { Skeleton } from "@chakra-ui/react";

export function MySkeleton(props: any) {
    return <Skeleton {...props} startColor="rgb(185 188 205 / 10%)" endColor="rgb(185 188 205 / 40% )"></Skeleton>
}

export interface SkeletonRandWidthProps {
    minw: number
    maxw: number
}

export function SkeletonRandWidth(props: SkeletonRandWidthProps | any) {

    const { minw, maxw, ...rest } = props;

    const curw = minw + (Math.random() * (maxw - minw));

    return <MySkeleton {...rest} width={curw + "px"}></MySkeleton>
}

