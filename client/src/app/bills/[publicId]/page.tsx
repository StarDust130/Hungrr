
import BillPage from "@/components/billComp/BillPage";

interface Props {
  params: Promise<{
    publicId: string;
  }>;
}

const BillPageRoute = async (props: Props) => {
  const { publicId } = await props.params;


  return <BillPage publicId={publicId} />;
};

export default BillPageRoute;
