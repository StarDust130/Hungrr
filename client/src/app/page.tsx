/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import {
  Smartphone,
  QrCode,
  Coffee,
  Clock,
  Star,
  Menu,
  X,
  ArrowRight,
  Check,
  Wifi,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";

export default function PremiumCafeLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  height={"500"}
                  width={"500"}
                />
              </div>
              <span className="text-xl font-semibold ">Hungrr</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="  transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="  transition-colors">
                How it works
              </a>
              <a href="#pricing" className="  transition-colors">
                Pricing
              </a>
              <Button className="px-6 py-2.5 rounded-lg font-medium  transition-colors">
                Get Started
              </Button>
              <ModeToggle />
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="  transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="  transition-colors">
                  How it works
                </a>
                <a href="#pricing" className="  transition-colors">
                  Pricing
                </a>
                <button className="px-6 py-3 rounded-lg font-medium w-full">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center  rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium ">
                  Now serving 500+ cafes
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold  mb-6 leading-tight">
                Modern cafe
                <br />
                <span>ordering</span>
              </h1>

              <p className="text-xl  mb-8 leading-relaxed">
                Transform your cafe with seamless QR code ordering. Customers
                scan, browse your menu, and order directly from their phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size={"lg"}>
                  Start free trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size={"lg"} variant={"outline"}>
                  See demo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm ">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No monthly fees</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 mx-auto max-w-sm ">
                <div className=" rounded-[2.5rem] p-4 ">
                  <div className=" rounded-[2rem] p-8 min-h-[500px] shadow-2xl flex flex-col border  overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                          <Image
                            src="/icon.png"
                            alt="Logo"
                            height={"500"}
                            width={"500"}
                          />
                        </div>
                        <span className="font-semibold">Menu</span>
                      </div>
                      <div className="w-8 h-8  rounded-full"></div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center p-4 border rounded-xl">
                        <div>
                          <h3 className="font-semibold">Cappuccino</h3>
                          <p className="text-sm ">
                            Rich espresso with steamed milk
                          </p>
                        </div>
                        <span className="font-semibold">$4.50</span>
                      </div>

                      <div className="flex justify-between items-center p-4 border  rounded-xl">
                        <div>
                          <h3 className="font-semibold">Croissant</h3>
                          <p className="text-sm ">Buttery, flaky pastry</p>
                        </div>
                        <span className="font-semibold">$3.20</span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-xl">
                        <div>
                          <h3 className="font-semibold">Latte</h3>
                          <p className="text-sm ">
                            Smooth coffee with milk foam
                          </p>
                        </div>
                        <span className="font-semibold">$4.80</span>
                      </div>
                    </div>

                    <Button size={"lg"}>Add to cart</Button>
                  </div>
                </div>
              </div>

              <div className="absolute -top-8 -left-8 w-24 h-24  rounded-2xl opacity-60"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32  rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold  mb-4">
              Everything you need to modernize your cafe
            </h2>
            <p className="text-xl  max-w-2xl mx-auto">
              Professional tools designed specifically for modern cafes and
              coffee shops.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "QR Code Menus",
                description:
                  "Custom QR codes for each table. Customers scan to instantly access your menu.",
              },
              {
                icon: Smartphone,
                title: "Mobile Ordering",
                description:
                  "Seamless mobile experience. Order and pay directly from their phone.",
              },
              {
                icon: Clock,
                title: "Real-time Updates",
                description:
                  "Live order tracking and instant notifications for kitchen and customers.",
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                description:
                  "Integrated payment processing with all major cards and digital wallets.",
              },
              {
                icon: Coffee,
                title: "Menu Management",
                description:
                  "Easy-to-use dashboard to update menu items, prices, and availability.",
              },
              {
                icon: Wifi,
                title: "Cloud-based",
                description:
                  "Access your cafe management tools from anywhere, anytime.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className=" p-8 rounded-2xl shadow-sm  transition-shadow border"
              >
                <div className="w-12 h-12  rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 " />
                </div>
                <h3 className="text-xl font-semibold  mb-3">{feature.title}</h3>
                <p className=" leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold  mb-4">
              How it works
            </h2>
            <p className="text-xl ">
              Get your cafe running with QR ordering in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Setup your menu",
                description:
                  "Upload your menu items, set prices, and customize your cafe's branding.",
              },
              {
                step: "02",
                title: "Generate QR codes",
                description:
                  "Create unique QR codes for each table and print them out.",
              },
              {
                step: "03",
                title: "Start serving",
                description:
                  "Customers scan, order, and pay. You focus on making great coffee.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center border p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold  mb-4">{step.title}</h3>
                <p className=" leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold  mb-4">
              Trusted by cafe owners everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Owner, Blue Mountain Cafe",
                content:
                  "Hungrr transformed how we serve customers. Orders are faster, more accurate, and our staff can focus on what they do best.",
              },
              {
                name: "Marcus Rodriguez",
                role: "Manager, Downtown Coffee",
                content:
                  "The setup was incredibly easy. Within an hour, we had QR codes on every table and orders started flowing in digitally.",
              },
              {
                name: "Emma Thompson",
                role: "Owner, Sunrise Bistro",
                content:
                  "Our customers love the convenience, and we've seen a 40% increase in average order value since implementing QR ordering.",
              },
            ].map((testimonial, index) => (
              <div key={index} className=" p-8 rounded-2xl shadow-sm  border">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className=" mb-6 leading-relaxed">{testimonial.content}</p>
                <div>
                  <p className="font-semibold ">{testimonial.name}</p>
                  <p className="text-sm ">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold  mb-6">
            Ready to modernize your cafe?
          </h2>
          <p className="text-xl  mb-8 max-w-2xl mx-auto">
            Join hundreds of cafes already using Hungrr to provide better
            service and increase revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size={"lg"}>Start your free trial</Button>
            <Button size={"lg"} variant={"outline"}>
              Schedule a demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 " />
              </div>
              <span className="text-xl font-semibold">Hungrr</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 ">
              <span>© 2025 Hungrr. All rights reserved.</span>
              <div className="flex gap-6">
                <a href="#" className=" transition-colors">
                  Privacy
                </a>
                <a href="#" className=" transition-colors">
                  Terms
                </a>
                <a href="#" className=" transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
