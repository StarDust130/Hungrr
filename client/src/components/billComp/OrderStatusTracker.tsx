// /app/bill/OrderStatusTracker.tsx (New File)

"use client";

import {
  Check,
  Loader,
  ChefHat,
  ShoppingBasket,
  CircleDollarSign,
} from "lucide-react";

type Status = "payment-pending" | "confirmed" | "preparing" | "ready";

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const Step = ({
  icon,
  title,
  description,
  isCompleted,
  isActive,
}: StepProps) => {
  const getStatusClasses = () => {
    if (isActive) return "border-blue-500 text-blue-500";
    if (isCompleted) return "border-green-500 text-green-500";
    return "border-gray-300 text-gray-400";
  };

  const getIcon = () => {
    if (isActive) return <Loader className="h-5 w-5 animate-spin" />;
    if (isCompleted) return <Check className="h-5 w-5" />;
    return icon;
  };

  return (
    <div className="flex items-start">
      <div className={`flex flex-col items-center mr-4`}>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusClasses()}`}
        >
          {getIcon()}
        </div>
        <div
          className={`w-0.5 h-16 mt-2 ${
            isCompleted ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
      </div>
      <div>
        <h3
          className={`font-bold ${
            isActive || isCompleted
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export const OrderStatusTracker = ({ status }: { status: Status }) => {
  const steps: {
    id: Status;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "payment-pending",
      title: "Payment Pending",
      desc: "Waiting for payment confirmation.",
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      id: "confirmed",
      title: "Order Confirmed",
      desc: "Your payment was successful.",
      icon: <Check className="h-5 w-5" />,
    },
    {
      id: "preparing",
      title: "Preparing Your Food",
      desc: "The kitchen has started your order. Approx. 15 mins.",
      icon: <ChefHat className="h-5 w-5" />,
    },
    {
      id: "ready",
      title: "Ready for Pickup",
      desc: "Your order is ready at the counter.",
      icon: <ShoppingBasket className="h-5 w-5" />,
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === status);

  // Remap "payment-pending" to be the first step for UI logic
  const displayStatus = status === "payment-pending" ? "confirmed" : status;
  const displayCurrentStepIndex = steps.findIndex(
    (step) => step.id === displayStatus
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border w-full">
      {status === "payment-pending" ? (
        <Step
          key="payment-pending"
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="Payment Pending"
          description="Please complete the payment below."
          isActive={true}
          isCompleted={false}
        />
      ) : (
        steps
          .slice(1)
          .map((step, index) => (
            <Step
              key={step.id}
              icon={step.icon}
              title={step.title}
              description={step.desc}
              isActive={index + 1 === displayCurrentStepIndex}
              isCompleted={index + 1 < displayCurrentStepIndex}
            />
          ))
      )}
    </div>
  );
};
