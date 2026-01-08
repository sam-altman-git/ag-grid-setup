import { colorSchemeDark, themeQuartz } from "ag-grid-community";

const main = themeQuartz.withPart(colorSchemeDark).withParams({
  menuBackgroundColor: "#26282b",
});

const radinAgGridTheme = {
  default: main,
};

export default radinAgGridTheme;
