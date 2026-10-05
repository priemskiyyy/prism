import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "src/theme/style.css";

export default { extends: DefaultTheme } satisfies Theme;
