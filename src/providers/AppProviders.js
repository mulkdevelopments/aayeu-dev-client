// providers/AppProviders.jsx
"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import QueryProvider from "@/providers/QueryProvider";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { ToastProvider } from "./ToastProvider";

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <QueryProvider>{children}</QueryProvider>
        </ToastProvider>
      </PersistGate>
      <Toaster position="top-center" theme="dark" richColors={true} />
    </Provider>
  );
}
