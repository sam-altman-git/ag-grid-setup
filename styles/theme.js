import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#90B8F8",
    },
    primary: {
      main: "#90B8F8",
    },
    secondary: {
      main: "#504EAA",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    root: {
      fontFamily: "--font-poppins",
    },
  },
  MuiOutlinedInput: {
    root: {
      "& .MuiInputBase-root ": {
        borderColor: red,
      },
      "& fieldset.MuiOutlinedInput-notchedOutline": {
        borderColor: "green",
      },
      "& $notchedOutline": {
        borderColor: "white",
      },
    },
  },
});

export default theme;
