import { useEffect, useRef } from "react";

interface TagEmbedWidgetProps {
  height?: number;
  width?: number;
}

const TagEmbedWidget = ({ height = 30 }: TagEmbedWidgetProps) => {
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
      className="tagembed-widget"
      style={{ width: "100%", height: `${height}px`, overflow: "auto" }}
      data-widget-id="303358"
      data-website="1"
    />
  );
};

export default TagEmbedWidget;
