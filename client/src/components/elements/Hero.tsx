import Image from "next/image"
import { Button } from "../ui/button"
import { ArrowRight, Check } from "lucide-react"

const Hero = () => {
  return (
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
  )
}
export default Hero