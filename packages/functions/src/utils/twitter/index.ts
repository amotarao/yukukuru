export interface TwitterUserData {
  id_str: string;
  screen_name: string;
  name: string;
  profile_image_url_https: string;
}

export interface TwitterUserAllData extends TwitterUserData {
  [key: string]: any;
}
