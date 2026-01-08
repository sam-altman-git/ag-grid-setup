import { useSelector } from "react-redux";
import CategoryIcon from "./CategoryIcon";

export const CategoryFilterCellRenderer = ({ value }) => {
  const tempCat = useSelector((state) => state.grid.categoryList);
  if (value === "(Select All)") {
    return <div>{value}</div>;
  }
  const categoryOb =
    tempCat.find(
      ({ categoryId }) => _.toString(value) === _.toString(categoryId),
    ) || {};
  const { label: category = "Unknown" } = categoryOb;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {value !== null && (
        <CategoryIcon
          containerStyle={{ marginRight: "0.25rem", padding: "2px" }}
          size="tiny"
          category={categoryOb}
        />
      )}
      {value === null ? "(Blanks)" : category}
    </div>
  );
};
