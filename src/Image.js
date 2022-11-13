import React from 'react';

export const Image = ({ image, onClick, clickable }) => {
  const hoverable = (typeof onClick === 'function');
  const style = hoverable ? clickable ? {cursor: "pointer"} : {cursor: "not-allowed"} : {};
  const handleClick = clickable ? onClick : ()=>{};
  return (image && <img style={style} src={image.startsWith("http") ? image : "data:image/jpeg;base64, " + image} onClick={handleClick} />);
};
