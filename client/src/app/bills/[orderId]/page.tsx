import BillPage from "@/components/menuComp/BillPage";
import CartProvider from "@/components/menuComp/CartProvider";

const page = () => {
  return (
    <CartProvider>
      <BillPage />
    </CartProvider>
  );
}
export default page