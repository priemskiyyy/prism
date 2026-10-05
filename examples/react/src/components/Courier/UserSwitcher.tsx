import type React from "react";
import { USER_IDS, USERS } from "examples/shared/courier/constants/users";
import type { UserId } from "examples/shared/courier/types/UserId";
import { PILL_CLASS_NAME } from "examples/shared/ui/styles/pillStyles";
import { segmentStyles } from "examples/shared/ui/styles/segmentStyles";

type UserSwitcherProps = {
  userId: UserId;
  onUserSelect: (userId: UserId) => void;
};

export const UserSwitcher: React.FunctionComponent<UserSwitcherProps> = ({
  userId,
  onUserSelect,
}) => (
  <div role="group" aria-label="Signed in as" className={PILL_CLASS_NAME}>
    {USER_IDS.map((id) => (
      <button
        key={id}
        type="button"
        aria-pressed={id === userId}
        onClick={() => onUserSelect(id)}
        className={segmentStyles({ selected: id === userId })}
      >
        <span
          aria-hidden="true"
          className="flex size-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          {USERS[id].initials}
        </span>
        {USERS[id].name}
      </button>
    ))}
  </div>
);
