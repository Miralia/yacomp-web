import { openSettings } from "../ui/settings";
import type { Toolbar } from "./toolbar";

export interface SettingsButton {
  cleanup: () => void;
}

export function createSettingsButton(toolbar: Toolbar): SettingsButton {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "_scf_settings_btn";
  button.title = "Settings";
  button.setAttribute("aria-label", "Open yacomp settings");

  const icon = document.createElement("span");
  icon.className = "_scf_settings_btn_icon";
  icon.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "3");
  svg.appendChild(circle);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.321-1.915",
  );
  svg.appendChild(path);

  icon.appendChild(svg);
  button.appendChild(icon);

  button.addEventListener("click", openSettings);
  toolbar.toolbarEl.appendChild(button);

  return { cleanup: () => button.remove() };
}
