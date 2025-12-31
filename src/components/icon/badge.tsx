"use client";

import type { ExtendedSvg } from "@components/icon/base.ts";
import clsx from "clsx";
import type { FC } from "react";

export const Badge: FC<ExtendedSvg> = ({
    class:        classes,
    "class:list": class_list,
    className,
    ...props
}) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={ clsx([
            `icon icon-tabler icons-tabler-outline icon-tabler-arrow-badge-right`,
            className,
            classes,
            class_list,
        ]) }
        { ...props }
    >
        <path stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
        />
        <path d="M13 7h-6l4 5l-4 5h6l4 -5z" />
    </svg>
);
