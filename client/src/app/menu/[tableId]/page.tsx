import CartProvider from "@/components/menuComp/CartProvider";
import MenuPageContent from "@/components/menuComp/MenuPageContent";


const MenuPage = () => (
  <CartProvider>
    <MenuPageContent />
  </CartProvider>
);

export default MenuPage;
