type Props = {
  pluralName: string;
  onReset: () => void;
};

export function SideNav({ pluralName, onReset }: Props) {
  return (
    <nav className="sideNav">
      <div className="sideNavHeader">
        <span className="sideNavTitle">{pluralName}</span>
        <span className="sideNavSubtitle">Avatar Tracker</span>
      </div>
      <ul className="sideNavLinks">
        <li className="sideNavItem sideNavItemActive">
          <span>🏠</span> Dashboard
        </li>
      </ul>
      <div className="sideNavFooter">
        <button className="sideNavReset" onClick={onReset}>↩ Start over</button>
      </div>
    </nav>
  );
}
