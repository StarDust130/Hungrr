import BillPage from "@/components/billComp/BillPage";
import CartProvider from "@/components/menuComp/CartProvider";

const page = () => {
  return (
    <CartProvider>
      <BillPage />
    </CartProvider>
  );
};
export default page;
