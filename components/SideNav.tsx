type Props = {
  pluralName: string;
};

export function SideNav({ pluralName }: Props) {
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
      <div className="sideNavFooter">v1.0</div>
    </nav>
  );
}
