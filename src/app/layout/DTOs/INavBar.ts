export interface INavBar {
  routeLink?: string;
  icon?: string;
  label: string;
  expanded?: boolean;
  items?: INavBar[];
}
