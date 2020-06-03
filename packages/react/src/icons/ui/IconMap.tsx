import React from 'react';

import { IconProps } from '../Icon.interface';
import classNames from '../../utils/classNames';
import styles from '../Icon.module.css';

const IconMap: React.FC<IconProps> = ({ size = 's', className = '', style = {}, ...rest }: IconProps) => (
  <svg
    className={classNames(styles.icon, styles[size], className)}
    style={style}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z" />
      <path
        d="M22 4.113V17.72l-7 2.333-6-2-7 2.333V6.78l7-2.333 6 2 7-2.333zM8 6.887L4 8.22v9.392l4-1.333V6.887zm2 0v9.392l4 1.333V8.22l-4-1.334zm10 0l-4 1.334v9.39l4-1.332V6.887z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export default IconMap;
