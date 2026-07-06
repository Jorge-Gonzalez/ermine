import SHADOW_STYLES from "./shadow.css?raw";

const TEMPLATE_STYLES = `
.template-card {
  margin: 4px;
}
`;

const shadowBundle = [SHADOW_STYLES, TEMPLATE_STYLES].join("\n");

export function mount(host, active) {
  const shadowRoot = host.attachShadow({ mode: "open" });
  createStyleInjector("fixture-shadow", shadowBundle, shadowRoot);
  host.style.left = "0px";
  return (
    <div
      className={`card duplicate ${active ? "selected" : ""} undefined-token`}
      style={{ color: "red" }}
    />
  );
}
