"use client";

import { CubeIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { clsx } from "clsx";
import NavItem from "./NavItem";
import { dataDensityAtom } from "@/atoms";

export function Sidebar() {
	const [density, setDensity] = useAtom(dataDensityAtom);

	return (
		<aside
			className="w-64 h-screen hidden md:flex flex-col p-4 gap-8"
		>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-stone-300 flex items-center justify-center">
					<span className="text-sm font-medium">DO</span>
				</div>
				<div className="flex flex-col">
					<span className="font-medium">Daniel&apos;s Org</span>
				</div>
			</div>

			<nav className="flex flex-col gap-1">
				<NavItem icon={<CubeIcon />} label="Tickets" active />
			</nav>

			<div className="flex flex-col gap-2 mt-auto pb-4">
				<label className="text-xs font-medium opacity-70 px-2">
					Data Density
				</label>
				<div className="flex gap-1">
					<DensityButton
						active={density === "empty"}
						onClick={() => setDensity("empty")}
					>
						Empty
					</DensityButton>
					<DensityButton
						active={density === "normal"}
						onClick={() => setDensity("normal")}
					>
						Normal
					</DensityButton>
					<DensityButton
						active={density === "dense"}
						onClick={() => setDensity("dense")}
					>
						Dense
					</DensityButton>
				</div>
			</div>
		</aside>
	);
}

function DensityButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"flex-1 px-2 py-1.5 text-xs rounded-sm transition-all duration-150",
				active
					? "bg-stone-900 text-white"
					: "bg-stone-100 text-stone-700 hover:bg-stone-200"
			)}
		>
			{children}
		</button>
	);
}
