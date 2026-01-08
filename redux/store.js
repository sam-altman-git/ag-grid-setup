import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import rootReducerObject from "./rootReducer"; // Object containing all the slice reducers

const rootReducer = combineReducers(rootReducerObject);

// Configure persistence options for the specific slice or persisting entire slice
const persistConfig = {
  key: "persistedSlices", // This is the key used to store the data in localStorage
  storage,
  whitelist: [], // Specify the slice(s) that you want to persist
  // blacklist: ['otherSlice'],// Optionally, We can also blacklist certain slices
};

// Wrap your root reducer with the persistReducer function
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
const store = configureStore({
  reducer: persistedReducer, // Pass your persisted root reducer
  middleware: (getDefaultMiddleware) => {
    // Add additional middleware here if needed
    return getDefaultMiddleware();
  },
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});

// Create a persistor object
const persistor = persistStore(store);

export { persistor };

export default store;
