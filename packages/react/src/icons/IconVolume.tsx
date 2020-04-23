import React from 'react';

type Props = {
  /**
   * Additional class names to apply to the icon
   */
  className?: string;
};

const IconVolume: React.FC<Props> = ({ className = '' }: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" className={className}>
    <path d="M10.6882469,18.0720375 L12.5347156,18.5665375 L11.2388094,23.403725 L9.39234062,22.9085063 L10.6882469,18.0720375 Z M18.4041,1 C19.7395375,1 20.9951938,1.51965625 21.9396313,2.463375 C22.88335,3.40853125 23.403725,4.6641875 23.403725,5.999625 C23.403725,7.33434375 22.88335,8.59 21.9396313,9.53515625 L21.9396313,9.53515625 L17.6443813,13.8347187 L17.6443813,21.461375 L2.94235,6.75934375 L10.5733188,6.75934375 L14.8685688,2.463375 C15.8130063,1.51965625 17.0693813,1 18.4041,1 Z M7.8261125,15.2257156 L9.17808125,16.5776844 L5.35433125,20.4007156 L4.0023625,19.0487469 L7.8261125,15.2257156 Z M10.5733188,8.67121875 L7.5581625,8.67121875 L15.7325063,16.8455625 L15.7325063,13.8347187 L10.5733188,8.67121875 Z M5.83646875,11.8682187 L6.33096875,13.7139687 L1.4945,15.0113125 L1,13.164125 L5.83646875,11.8682187 Z M18.4041,2.91115625 C17.578975,2.91115625 16.8034438,3.2324375 16.2205375,3.8160625 L16.2205375,3.8160625 L12.3206,7.71528125 L16.6884438,12.0874375 L20.5869438,8.1831875 C21.7915688,6.9785625 21.7915688,5.01996875 20.5869438,3.8160625 C20.0047563,3.2324375 19.2285063,2.91115625 18.4041,2.91115625 Z" />
  </svg>
);

export default IconVolume;
