import { motion } from "framer-motion";
import { LayoutDashboard, Smartphone, Mail, MapPin } from "lucide-react";
import Logo from "@/components/elements/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "Built for NSUK", href: "#about" },
	{ label: "FAQ", href: "#faq" },
];

export default function CtaFooterSection() {
	return (
		<footer id="contact" className="bg-primary">
			{/* CTA top half */}
			<div className="px-4 sm:px-6 lg:px-8 py-20 border-b border-white/20">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						<h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
							Ready to End the Scheduling Chaos?
						</h2>
						<p className="text-base text-white/75 leading-relaxed mb-10 max-w-xl mx-auto">
							TimeMapper is live at NSUK. If you're an administrator, request
							access. If you're a student or staff member, download the mobile
							app.
						</p>

						<div className="flex flex-wrap items-center justify-center gap-4">
							<Button
								variant="secondary"
								size="lg"
								leftIcon={<LayoutDashboard size={18} />}
								onClick={() => (window.location.href = "/login")}
								className="bg-white text-primary hover:bg-white/90 border-transparent font-bold shadow-lg"
							>
								Access the Dashboard
							</Button>
							<Button
								variant="outline"
								size="lg"
								leftIcon={<Smartphone size={18} />}
								onClick={() => {
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
								className="border-2 border-white/60 text-white hover:bg-white/10 hover:text-white bg-transparent font-bold"
							>
								Download the App
							</Button>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Footer bottom half */}
			<div className="px-4 sm:px-6 lg:px-8 py-12">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-10">
						{/* Institution branding */}
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2.5">
								<Logo color="#ffffff" size={28} />
								<span className="text-white font-bold text-lg">TimeMapper</span>
							</div>
							<p className="text-white/70 text-sm leading-relaxed max-w-xs">
								Built for Nasarawa State University, Keffi — unified lecture and
								exam timetabling, venue governance, and discrepancy reporting.
							</p>
						</div>

						{/* Contact details */}
						<div className="flex flex-col gap-2.5">
							<h3 className="text-xs font-bold uppercase tracking-widest text-white/60">
								Contact & Support
							</h3>
							<a
								href="mailto:timemapper@nsuk.edu.ng"
								className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
							>
								<Mail size={15} className="shrink-0" />
								<span>timemapper@nsuk.edu.ng</span>
							</a>
							<div className="inline-flex items-start gap-2 text-sm text-white/70">
								<MapPin size={15} className="shrink-0 mt-0.5" />
								<span>ICT Directorate, NSUK, Keffi, Nasarawa State</span>
							</div>
						</div>

						{/* Nav links */}
						<div className="flex flex-col gap-2.5 md:items-end">
							<h3 className="text-xs font-bold uppercase tracking-widest text-white/60">
								Quick Links
							</h3>
							<nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
								{NAV_LINKS.map((link) => (
									<a
										key={link.label}
										href={link.href}
										className="text-sm text-white/80 hover:text-white transition-colors"
									>
										{link.label}
									</a>
								))}
							</nav>
						</div>
					</div>

					{/* Bottom bar */}
					<div className="border-t border-white/20 pt-6 text-center">
						<p className="text-xs text-white/50">
							© 2026 TimeMapper · Nasarawa State University, Keffi · All rights
							reserved
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
