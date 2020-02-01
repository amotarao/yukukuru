/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { NavStyle } from './styled';

interface SiteNavProps {
  signOut: () => Promise<void>;
}

export const SiteNav: React.FC<SiteNavProps> = () => {
  return (
    <nav css={NavStyle}>
      <ul>
        <li>
          <a href="">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTT81eb5aF5-fLfqivMtJra9Dah-8bL_1NP2Hi1YkvKNbv-QoL8" width="32" height="32" />
          </a>
        </li>
        <li className="user">
          <a href="">
            <img src="https://pbs.twimg.com/profile_images/1206874530540486657/cLyI3tuI_400x400.png" alt="ユーザー設定" />
          </a>
        </li>
        <li>
          <a href="">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTCRKTLQzWRQKUzZSHljy9uCpjetu9VG2K9WVzzO7Jc0neXEsdF" width="32" height="32" />
          </a>
        </li>
      </ul>
    </nav>
  );
};
