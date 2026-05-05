import type { Dark, Root } from "@repo/types";

function serializeTheme<TTheme extends Dark | Root>(theme: TTheme) {
  return Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${String(value)};`)
    .join("\n");
}

export function createEnterpriseThemeCss(
  themeConfig?: { dark?: Dark; root?: Root } | null,
) {
  if (!themeConfig) {
    return null;
  }

  return `
    :root {
${serializeTheme(themeConfig.root ?? ({} as Root))}
    }
    .dark {
${serializeTheme(themeConfig.dark ?? ({} as Dark))}
    }
  `;
}
