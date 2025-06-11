import { Atom } from "lucide-react";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex justify-center items-center h-screen  flex-col space-y-4">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Atom className="h-6 w-6 animate-spin" />
        <span className="font-medium">Loading Menu ...</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Please wait while we prepare your content.
      </p>
    </div>
  );
}
