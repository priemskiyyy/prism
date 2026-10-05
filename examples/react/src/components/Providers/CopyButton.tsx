import type React from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { COPY_FEEDBACK_DURATION } from "src/utils/constants/copyFeedback";

type CopyButtonProps = { text: string };

export const CopyButton: React.FunctionComponent<CopyButtonProps> = ({
  text,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);

    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyPress = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <button
      type="button"
      onClick={handleCopyPress}
      className={buttonStyles({ size: "small" })}
    >
      {copied ? (
        <Check aria-hidden="true" size={14} weight="bold" />
      ) : (
        <Copy aria-hidden="true" size={14} weight="bold" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};
