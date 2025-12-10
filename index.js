import React from "react";
import ReactDOM from "react-dom/client";

// 一个简单的占位 App，你可以先确认页面不再黑屏
// 后面再把真正的内容塞进来
function App() {
  return React.createElement(
    "div",
    {
      className:
        "w-full h-full flex flex-col items-center justify-center text-white gap-4",
    },
    React.createElement(
      "h1",
      { className: "text-3xl font-serif tracking-wide" },
      "Grand Luxury Christmas Tree"
    ),
    React.createElement(
      "p",
      { className: "text-sm text-gray-300 max-w-md text-center" },
      "If you can see this, React is working. Now you can replace this placeholder with your real 3D tree UI."
    )
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(App, null)
  )
);
