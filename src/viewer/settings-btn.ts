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
  icon.textContent = "\u2699";
  button.appendChild(icon);

  button.addEventListener("click", openSettings);
  toolbar.toolbarEl.appendChild(button);

  return { cleanup: () => button.remove() };
}
