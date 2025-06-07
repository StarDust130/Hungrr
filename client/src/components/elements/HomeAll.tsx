import {
  Smartphone,
  QrCode,
  Coffee,
  Clock,
  Star,
  Wifi,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
const HomeAll = () => {
  return (
    <div>
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
          <div className="relative w-full  mx-auto  flex justify-center items-center mb-4 md:mb-8">
            <Image
              src="/anime-girl-2.png"
              alt="Anime Girl"
              width={200}
              height={200}
              className="object-contain rounded-3xl"
              priority
            />
          </div>
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
    </div>
  );
}
export default HomeAll