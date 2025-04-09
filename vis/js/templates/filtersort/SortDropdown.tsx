import React from "react";
import {
  DropdownButton,
  MenuItem,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";

export interface SortDropdownProps {
  label: string;
  value: string;
  valueLabel: string;
  options: any[];
  handleChange: (id: string) => void;
}

const SortDropdown = ({ label, value, valueLabel, options, handleChange }: SortDropdownProps) => {
  const { trackEvent } = useMatomo();
  const localization = useLocalizationContext();

  const handleSortChange = (id: string) => {
    handleChange(id);
    const selectedOption = options.find((o) => o.id === id);
    trackEvent(
      "List controls",
      "Sort list",
      selectedOption ? selectedOption.label : undefined
    );
  };

  return (
    <div
      className="dropdown"
      id="sort_container"
      style={{ display: "inline-block" }}
    >
      <DropdownButton
        id="sort"
        noCaret
        className="truncate-text"
        title={
          <>
           <span style={{
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <span>{label}</span>
              <span id="curr-filter-type" className="truncate-text" style={{
                minWidth: '0px',
                marginLeft: "3px"
              }}>{valueLabel}</span>
              <i className="fas fa-chevron-down chevron" style={{
                marginLeft: "3px",
              }}/>
            </span>
          </>
        }
      >
        {options.map((o) => (
          <MenuItem
            id={"sort_option_" + o.id}
            key={o.id}
            eventKey={o.id}
            // @ts-ignore
            onSelect={handleSortChange}
            active={o.id === value}
          >
            <div className="wrap">{o.label}</div>
          </MenuItem>
        ))}
      </DropdownButton>
    </div>
  );
};

export default SortDropdown;
