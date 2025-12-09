"use client";

import { CubeIcon } from "@radix-ui/react-icons";
import NavItem from "./NavItem";

export function Sidebar() {
	return (
		<aside
			className="w-64 h-screen flex flex-col p-4 gap-8"
		>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
					<span className="text-sm font-medium">DO</span>
				</div>
				<div className="flex flex-col">
					<span className="font-medium text-sm">Daniel&apos;s Org</span>
				</div>
			</div>

			<nav className="flex flex-col gap-1">
				<NavItem icon={<CubeIcon />} label="Tickets" active />
			</nav>
		</aside>
	);
}
