
import BillPage from "@/components/billComp/BillPage";
import { log } from "@/lib/helper";

interface Props {
  params: Promise<{
    publicId: string;
  }>;
}

const BillPageRoute = async (props: Props) => {
  const { publicId } = await props.params;

  log("😇 BillPageRoute: publicId from URL:", publicId);

  return <BillPage publicId={publicId} />;
};

export default BillPageRoute;
