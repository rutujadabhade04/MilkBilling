import { useIsMobile } from "../external/vite-sdk";
export default function formLayout() {
  let cardStyle = `row bg-white p-1 rounded-4 shadow-sm border border-primary my-2 `;
  let rowWidth = useIsMobile() ? "w-100" : "w-75";
  const cols =
    window.formLayout == "singleColumn"
      ? "col-12 col-md-7"
      : window.formLayout == "doubleColumns"
      ? "col-12 col-md-6"
      : "";
  cardStyle +=
    window.formLayout == "singleColumn"
      ? `${rowWidth} mx-auto myb`
      : window.formLayout == "doubleColumns"
      ? `${rowWidth}  mx-auto myb`
      : "";
  return { cardStyle, cols };
}
