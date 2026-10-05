import { For } from "solid-js";
import type { Component } from "solid-js";
import { USER_IDS, USERS } from "examples/shared/courier/constants/users";
import type { UserId } from "examples/shared/courier/types/UserId";
import { PILL_CLASS_NAME } from "examples/shared/ui/styles/pillStyles";
import { segmentStyles } from "examples/shared/ui/styles/segmentStyles";

type UserSwitcherProps = {
  userId: UserId;
  onUserSelect: (userId: UserId) => void;
};

export const UserSwitcher: Component<UserSwitcherProps> = (props) => (
  <div role="group" aria-label="Signed in as" class={PILL_CLASS_NAME}>
    <For each={USER_IDS}>
      {(id) => (
        <button
          type="button"
          aria-pressed={id === props.userId}
          class={segmentStyles({ selected: id === props.userId })}
          onClick={() => props.onUserSelect(id)}
        >
          <span
            aria-hidden="true"
            class="flex size-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-white dark:bg-zinc-200 dark:text-zinc-900"
          >
            {USERS[id].initials}
          </span>
          {USERS[id].name}
        </button>
      )}
    </For>
  </div>
);
