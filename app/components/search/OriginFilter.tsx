import { type MouseEvent, useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import clsx from "clsx";

type Origins = Array<{ name: string }>;
export type OriginFilterValue = string[];

export function OriginFilter(props: {
  origins: Origins;
  value: OriginFilterValue;
  onChange: (value: OriginFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCount = props.value.length;

  function toggle(name: string) {
    if (props.value.includes(name)) {
      props.onChange(props.value.filter((n) => n !== name));
      return;
    }

    props.onChange([...props.value, name]);
  }

  function onResetClick(e: MouseEvent) {
    e.stopPropagation();
    props.onChange([]);
  }

  function onCloseClick(e: MouseEvent) {
    e.stopPropagation();
    setOpen(false);
  }

  return (
    <button className="btn btn-sm mr-2" onClick={() => setOpen(true)}>
      Origin
      {0 < selectedCount && <span className="badge badge-sm badge-secondary">{selectedCount}</span>}
      <Modal open={open} onClose={() => setOpen(false)} position="bottom" backdrop className="overflow-hidden">
        <div className="overflow-auto relative max-h-[75vh]">
          <div className="join flex join-vertical mb-6">
            {props.origins.map((country) => (
              <button
                className={clsx(
                  "join-item btn btn-block justify-start",
                  props.value.includes(country.name) && "btn-primary",
                )}
                onClick={() => toggle(country.name)}
                key={country.name}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto relative max-h-[75vh]">
          <div className="flex bg-white sticky bottom-0">
            <button className="btn mr-2" onClick={onResetClick}>
              Clear
            </button>
            <button className="btn btn-primary flex-1" onClick={onCloseClick}>
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </button>
  );
}
