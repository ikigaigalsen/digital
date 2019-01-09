/**
 * Type of a public notice from the Boston.gov public notices v1 API:
 *
 * https://www.boston.gov/api/v1/public-notices
 */
export default interface Notice {
  is_testimony: '';
  id: string;
  testimony_time: string;
  /** HTML */
  title: string;
  location_name: string;
  location_room: string;
  location_street: string;
  canceled: '0' | '1';
  notice_date: string;
  notice_time: string;
  /**
   * @example "01/04/2019 - 11:21am"
   */
  posted: string;
  /** Array of HTML */
  field_drawer: string[];
  body: string;
}
