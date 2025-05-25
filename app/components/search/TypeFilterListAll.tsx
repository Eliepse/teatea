import { Modal } from "~/components/shared/modal/Modal";
import { type MouseEvent, useState } from "react";
import clsx from "clsx";

export type Categories = { [key: string]: string[] };
export type TypeFilterValue = { [key: string]: string[] | boolean };

export function TypeFilterListAll(props: {
  types: Categories;
  value: TypeFilterValue;
  onChange: (value: TypeFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCount = Object.entries(props.value).reduce((c, [_, types]) => {
    if (Array.isArray(types)) {
      return c + types.length;
    }

    if (true === types) {
      return c + 1;
    }

    return c;
  }, 0);

  function toggleType(category: string, type?: string): void {
    const types = props.value[category] ?? false;

    if (undefined === type) {
      props.onChange({ ...props.value, [category]: Array.isArray(types) ? true : !types });
      return;
    }

    if (!Array.isArray(types)) {
      props.onChange({ ...props.value, [category]: [type] });
      return;
    }

    if (types.includes(type)) {
      props.onChange({ ...props.value, [category]: types.filter((t) => t !== type) });
      return;
    }

    props.onChange({ ...props.value, [category]: [...types, type] });
  }

  function isSelected(category: string, type?: string): boolean {
    const types = props.value[category] ?? false;

    if (undefined === type) {
      return true === types;
    }

    return Array.isArray(types) && types.includes(type);
  }

  function onCloseClick(e: MouseEvent) {
    e.stopPropagation();
    setOpen(false);
  }

  function onResetClick(e: MouseEvent) {
    e.stopPropagation();
    props.onChange({});
    setOpen(false);
  }

  return (
    <button className="btn btn-sm mr-2" onClick={() => setOpen(true)}>
      Type
      {0 < selectedCount && <span className="badge badge-sm badge-secondary">{selectedCount}</span>}
      <Modal open={open} onClose={() => setOpen(false)} position="bottom" backdrop className="overflow-hidden">
        <div className="overflow-auto relative max-h-[75vh]">
          {Object.entries(props.types).map(([category, types]) => (
            <>
              <div className="uppercase text-sm text-base-content/50 mb-2 bg-white sticky top-0">{category}</div>

              <div className="join flex join-vertical mb-6">
                <button
                  className={clsx("join-item btn btn-block justify-start", isSelected(category) && "btn-primary")}
                  onClick={() => toggleType(category)}
                >
                  Any
                </button>

                {types.map((type) => (
                  <button
                    className={clsx(
                      "join-item btn btn-block justify-start",
                      isSelected(category, type) && "btn-primary",
                    )}
                    onClick={() => toggleType(category, type)}
                    key={category + type}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </>
          ))}
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
