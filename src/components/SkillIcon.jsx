import { createElement, useState } from "react";
import { getSkillIcon, getSkillIconColor } from "../data/skillIcons";

function IconGlyph({ icon, className, alt, color }) {
  return createElement(getSkillIcon(icon), {
    className,
    style: { color },
    "aria-hidden": alt ? undefined : true,
  });
}

function RemoteIcon({ source, icon, className, alt, color }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return <IconGlyph icon={icon} className={className} alt={alt} color={color} />;
  }

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}

export default function SkillIcon({ icon = "code", iconUrl = "", className = "", alt = "", color = "" }) {
  const source = iconUrl.trim();
  const iconColor = color || getSkillIconColor(icon);

  if (source) {
    return <RemoteIcon key={source} source={source} icon={icon} className={className} alt={alt} color={iconColor} />;
  }

  return <IconGlyph icon={icon} className={className} alt={alt} color={iconColor} />;
}
