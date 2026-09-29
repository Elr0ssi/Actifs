import type { WidgetData } from "@/lib/data/widgets";
import type { WidgetOpts, WidgetSize } from "@/lib/widgets/registry";

export interface WidgetProps {
  data: WidgetData;
  size: WidgetSize;
  opts: WidgetOpts;
  setOpts: (patch: WidgetOpts) => void;
}
