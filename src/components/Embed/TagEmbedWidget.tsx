import { useEffect, useRef } from "react";

interface TagEmbedWidgetProps {
  height?: number; // optional, default to 500
}

const TagEmbedWidget = ({ height = 500 }: TagEmbedWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.getElementById("tagembed-script");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = "https://widget.tagembed.com/embed.min.js";
    script.id = "tagembed-script";
    script.async = true;

    if (containerRef.current) containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      className="tagembed-widget w-full"
      style={{ width: "100%", height: `${height}px`, overflow: "auto" }}
      data-widget-id="299752"
      data-website="1"
    />
  );
};

export default TagEmbedWidget;
