// Chatori Jeeb Loading Screen Component
import { Logo } from "./Logo";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-yellow-400 via-yellow-300 to-orange-200 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-bounce">
          <Logo size="xl" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Chatori Jeeb</h1>
          <p className="text-gray-700">India's Fastest Food Delivery</p>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};
