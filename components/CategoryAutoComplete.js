import { Chip, TextField, Autocomplete } from "@mui/material";
import CategoryIcon from "./CategoryIcon";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core";

export default function CategoryAutoComplete(props) {
  const userPreference = useSelector((state) => state.settings);
  const { darkTheme } = userPreference;
  const autocompleteThemedStyles = makeStyles(() => ({
    inputRoot: {
      color: darkTheme ? "white" : "",
    },
    root: {
      "&": {
        color: darkTheme ? "white" : "",
      },
      "&::placeholder": {
        color: darkTheme ? "white" : "",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#90B8F8 !important", // Change the border color when focused
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: darkTheme ? "#FFFFFF80" : "",
      },
      "& .Mui-focused,input,input:focus": {
        color: darkTheme ? "white" : "",
      },
      "& label, .Mui-disabled": {
        color: darkTheme ? "#9D9D9D" : "",
      },
    },
    paper: {
      backgroundColor: darkTheme ? "#26282B" : "",
      color: darkTheme ? "white" : "",
      "& .MuiAutocomplete-listbox": {
        maxHeight: `33vh !important`,
      },
    },
    clearIndicator: {
      color: darkTheme ? "white" : "",
    },
    popupIndicator: {
      color: darkTheme ? "white" : "",
    },
    noOptions: {
      color: "#FFF !important",
    },
  }));
  const autocompleteclasses = autocompleteThemedStyles();

  const {
    sx = {},
    label = "Categories",
    placeholder = "Categories",
    onChange = () => console.warn("onChange required"),
    onChipDelete = () => console.warn("onChipDelete required"),
    onChipClicked = () => console.warn("onChipClicked required"),
    options = [],
    className = "",
    size = "small",
    value = [],
    ChipProps = {},
    classes,
  } = props;
  return (
    <Autocomplete
      disablePortal
      multiple
      fullWidth
      filterSelectedOptions
      id="category-input"
      size={size}
      classes={classes ?? (darkTheme ? autocompleteclasses : className)}
      sx={sx}
      options={options}
      onChange={onChange}
      value={value}
      getOptionLabel={(ob) => ob?.category}
      noOptionsText={<span style={{ color: "white" }}>No Options</span>}
      renderOption={(props, option) => {
        return (
          <p
            onClick={props.onClick}
            onMouseMove={props.onMouseMove}
            onTouchStart={props.onTouchStart}
            data-option-index={props["data-option-index"]}
            className={`${props.className}`}
            id={props.id}
            // key={props.key}
            style={{ color: "white", width: "100%" }}
            role={props.role}
            tabIndex={props.tabIndex}
            aria-selected={props["aria-selected"]}
            aria-disabled={props["aria-disabled"]}
          >
            <span style={{ marginRight: "0.5rem" }}>
              <CategoryIcon size={size} category={option} />
            </span>
            {option?.label || option?.category}
          </p>
        );
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) =>
          option ? (
            <Chip
              key={index}
              size={size}
              icon={<CategoryIcon size={size} category={option} />}
              label={option?.category}
              onClick={onChipClicked}
              onDelete={onChipDelete}
              {...getTagProps({ index })}
              {...ChipProps}
              sx={{
                backgroundColor: darkTheme ? "#FFFFFF14" : "",
                color: darkTheme ? "white" : "",
                margin: "2px 2px 5px 2px !important",
                "& .MuiChip-deleteIcon": {
                  color: darkTheme ? "#FFFFFF90" : "",
                },
              }}
            />
          ) : (
            <></>
          ),
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={!value.length ? placeholder : ""}
        />
      )}
    />
  );
}
